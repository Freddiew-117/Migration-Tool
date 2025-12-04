// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CIFIMigration
 * @notice Migration contract for locking CIFI V1 tokens on XDC Network
 * @dev Users migrate CIFI V1 tokens which are locked in this contract.
 *      EPS tokens are distributed manually on BASE Network by admin.
 */
contract CIFIMigration is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // CIFI V1 Token Contract
    IERC20 public immutable cifiV1;

    // Migration tracking
    uint256 public totalMigrated;
    mapping(address => uint256) public userMigrated;

    // Migration events
    event Migration(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    event TokensWithdrawn(address indexed to, uint256 amount);

    /**
     * @notice Constructor
     * @param _cifiV1 Address of the CIFI V1 token contract
     */
    constructor(address _cifiV1) Ownable(msg.sender) {
        require(_cifiV1 != address(0), "CIFIMigration: Invalid CIFI V1 address");
        cifiV1 = IERC20(_cifiV1);
    }

    /**
     * @notice Migrate CIFI V1 tokens (lock them in this contract)
     * @param amount Amount of CIFI V1 tokens to migrate
     * @dev User must approve this contract to spend their CIFI V1 tokens first
     */
    function migrate(uint256 amount) external nonReentrant {
        require(amount > 0, "CIFIMigration: Amount must be greater than 0");
        
        address user = msg.sender;
        
        // Check user has sufficient balance
        uint256 userBalance = cifiV1.balanceOf(user);
        require(userBalance >= amount, "CIFIMigration: Insufficient balance");

        // Check user has approved sufficient amount
        uint256 allowance = cifiV1.allowance(user, address(this));
        require(allowance >= amount, "CIFIMigration: Insufficient allowance");

        // Transfer tokens from user to this contract (lock them)
        cifiV1.safeTransferFrom(user, address(this), amount);

        // Update tracking
        totalMigrated += amount;
        userMigrated[user] += amount;

        // Emit event for off-chain tracking
        emit Migration(user, amount, block.timestamp, block.number);
    }

    /**
     * @notice Get user's migration statistics
     * @param user Address of the user
     * @return total Total amount migrated by user
     * @return dailyMigrated Daily migrated amount (always 0, no daily limits)
     * @return remainingDaily Remaining daily capacity (always max, no limits)
     * @return isWhitelisted Always returns false (whitelist removed)
     */
    function getUserStats(address user) external view returns (
        uint256 total,
        uint256 dailyMigrated,
        uint256 remainingDaily,
        bool isWhitelisted
    ) {
        return (
            userMigrated[user],
            0, // No daily tracking
            type(uint256).max, // No daily limits
            false // Whitelist removed
        );
    }

    /**
     * @notice Get global migration statistics
     * @return migrated Total amount migrated across all users
     * @return remaining Remaining capacity (always max, no limits)
     * @return v2Balance Locked CIFI V1 tokens in this contract
     * @return v1Balance Total CIFI V1 supply
     */
    function getGlobalStats() external view returns (
        uint256 migrated,
        uint256 remaining,
        uint256 v2Balance,
        uint256 v1Balance
    ) {
        return (
            totalMigrated,
            type(uint256).max, // No limits
            cifiV1.balanceOf(address(this)), // Locked tokens
            cifiV1.totalSupply() // Total supply
        );
    }

    /**
     * @notice Check if user can migrate a specific amount
     * @param user Address of the user
     * @param amount Amount to check
     * @return canMigrate Whether user can migrate this amount
     */
    function canMigrate(address user, uint256 amount) external view returns (bool) {
        if (amount == 0) return false;
        
        // Check user has sufficient balance
        if (cifiV1.balanceOf(user) < amount) return false;
        
        // Check user has approved sufficient amount
        if (cifiV1.allowance(user, address(this)) < amount) return false;
        
        return true;
    }

    /**
     * @notice Get user's remaining daily capacity (always max, no limits)
     * @param user Address of the user
     * @return Remaining daily capacity (always max)
     */
    function getUserRemainingDailyCapacity(address user) external pure returns (uint256) {
        return type(uint256).max; // No daily limits
    }

    /**
     * @notice Get remaining global capacity (always max, no limits)
     * @return Remaining global capacity (always max)
     */
    function getRemainingGlobalCapacity() external pure returns (uint256) {
        return type(uint256).max; // No limits
    }

    /**
     * @notice Get total migrated amount
     * @return Total amount of CIFI V1 tokens migrated
     */
    function totalMigratedAmount() external view returns (uint256) {
        return totalMigrated;
    }

    /**
     * @notice Check if migration is enabled (always true)
     * @return Always returns true
     */
    function migrationEnabled() external pure returns (bool) {
        return true;
    }

    /**
     * @notice Withdraw locked tokens (owner only, emergency use)
     * @param to Address to send tokens to
     * @param amount Amount to withdraw
     * @dev Only owner can withdraw locked tokens (for emergency situations)
     */
    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "CIFIMigration: Invalid address");
        require(amount > 0, "CIFIMigration: Invalid amount");
        
        uint256 balance = cifiV1.balanceOf(address(this));
        require(balance >= amount, "CIFIMigration: Insufficient balance");
        
        cifiV1.safeTransfer(to, amount);
        emit TokensWithdrawn(to, amount);
    }

    /**
     * @notice Get contract's locked token balance
     * @return Balance of locked CIFI V1 tokens
     */
    function getLockedBalance() external view returns (uint256) {
        return cifiV1.balanceOf(address(this));
    }
}

