import {
    speculateFunctionName,
    AwsRegion,
    getRenderProgress,
    renderMediaOnLambda,
  } from "@remotion/lambda/client";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { DISK, RAM, TIMEOUT, REGION, SITE_NAME, COMPOSITION_ID } from "@/remotion/config";
import { sleep } from "openai/core.mjs";


// Environment and configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Database client
const getSupabaseAdmin = () => {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase environment variables');
      return null;
    }
    
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
};
  
// Request body schema definition
const requestBodySchema = z.object({
    videoId: z.string()
});
// Error response formatting
function createErrorResponse(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
  }
  
// Success response formatting
function createSuccessResponse(videoId: string) {
    return NextResponse.json({ 
        success: true, 
        videoId,
        message: 'Video rendered successfully'
    });
}
  

export async function POST(request: Request) {
// Get Supabase admin client for this request
const supabaseAdmin = getSupabaseAdmin();
  
if (!supabaseAdmin) {
  return createErrorResponse('Database connection failed. Check your environment variables.', 500);
}

    const parsedBody = requestBodySchema.safeParse(await request.json());
    if (!parsedBody.success) {
        console.log(parsedBody.error);
        return createErrorResponse('error', 400);
    }

    const {
        videoId
    } = parsedBody.data;

    const { error, data } = await supabaseAdmin.from('videos').select('*').eq('request_id', videoId).single();
    if (error) {
        return createErrorResponse(error.message, 500);
    }

    const { transaction_reports, report_address, chain_id, network_name, balance, transaction_count, intro_text, outro_text } = data;
    const props = {props: {
        userAddress: report_address,
        chainId: chain_id || 1,
        networkName: network_name || "Ethereum",
        balance: balance || "0",
        transactionCount: transaction_count || 0,
        introText: intro_text || "",
        outroText: outro_text || "",
        reports: transaction_reports
      }}
    //   renderId: string;
    //   bucketName: string;
    //   cloudWatchLogs: string;
    //   cloudWatchMainLogs: string;
    //   lambdaInsightsLogs: string;
    //   folderInS3Console: string;
    //   progressJsonInConsole: string;
  const { renderId, bucketName, cloudWatchLogs, cloudWatchMainLogs, lambdaInsightsLogs, folderInS3Console, progressJsonInConsole } = await renderMediaOnLambda({
    codec: "h264",
    functionName: speculateFunctionName({
      diskSizeInMb: DISK,
      memorySizeInMb: RAM,
      timeoutInSeconds: TIMEOUT,
    }),
    region: REGION as AwsRegion,
    serveUrl: SITE_NAME,
    composition: COMPOSITION_ID,
    inputProps: props,
    framesPerLambda: 10,
    downloadBehavior: {
      type: "download",
      fileName: "video.mp4",
    },
  });
  console.log({renderId, bucketName, cloudWatchLogs, cloudWatchMainLogs, lambdaInsightsLogs, folderInS3Console, progressJsonInConsole})

  while(true){
  const renderProgress = await getRenderProgress({
    bucketName,
    functionName: speculateFunctionName({
      diskSizeInMb: DISK,
      memorySizeInMb: RAM,
      timeoutInSeconds: TIMEOUT,
    }),
    region: REGION as AwsRegion,
    renderId,
  });

  if (renderProgress.fatalErrorEncountered) {
    return {
      type: "error",
      message: renderProgress.errors[0].message,
    };
  }

  if (renderProgress.done) {
    return {
      type: "done",
      url: renderProgress.outputFile as string,
      size: renderProgress.outputSizeInBytes as number,
    };
  }
  await sleep(3000);
}

}