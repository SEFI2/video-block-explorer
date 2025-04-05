// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VideoReportNFT
 * @dev A contract for minting video report NFTs, with ability to receive ETH
 */
contract VideoReportNFT is ERC721Enumerable, Ownable {
    // Token counter
    uint256 private _nextTokenId;
    
    // Struct to store video metadata
    struct VideoData {
        string videoURI;
        uint256 timestamp;
    }
    
    // Mapping from token ID to video data
    mapping(uint256 => VideoData) private _videoData;
    
    // Events
    event VideoTokenMinted(address indexed to, uint256 indexed tokenId, string videoURI);
    
    // Constructor
    constructor() ERC721("VideoReportNFT", "VRNFT") Ownable(msg.sender) {}
    
    /**
     * @dev Function to mint a new video token
     * @param to The address that will receive the minted token
     * @param videoURI The URI containing metadata about the video
     * @return The ID of the newly minted token
     */
    function mintVideoToken(address to, string memory videoURI) external payable returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _mint(to, tokenId);
        
        _videoData[tokenId] = VideoData({
            videoURI: videoURI,
            timestamp: block.timestamp
        });
        
        emit VideoTokenMinted(to, tokenId, videoURI);
        
        return tokenId;
    }
    
    /**
     * @dev Get the metadata for a video token
     * @param tokenId The ID of the token
     * @return Video metadata
     */
    function getVideoData(uint256 tokenId) external view returns (VideoData memory) {
        require(_exists(tokenId), "VideoReportNFT: Query for nonexistent token");
        return _videoData[tokenId];
    }
    
    /**
     * @dev Checks if a token ID exists
     * @param tokenId The ID to check
     * @return Whether the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev Withdraw contract balance to owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Allows contract to receive ETH
     */
    receive() external payable {}
} 