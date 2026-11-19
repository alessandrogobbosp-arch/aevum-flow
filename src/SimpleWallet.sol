// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleWallet {
	address public owner;
	IERC20 public immutable tusd8;

	// Agent spending limits
	mapping(address => uint256) public agentDailyLimit;
	mapping(address => uint256) public agentSpentToday;
	mapping(address => uint256) public lastReset;
	
	event Sent(address indexed to, uint256 amount);
	event Received(address indexed from, uint256 amount);
	event AgentLimitSet(address indexed agent, uint256 dailyLimit);

	constructor(address _tusd8) {
		owner = msg.sender;
		tusd8 = IERC20(_tusd8);
	}

	
	modifier onlyOwner() {
		require(msg.sender == owner, "Not owner");
		_;
	}
	
	function setAgentLimit(address agent, uint256 dailyLimit) external
onlyOwner {
	agentDailyLimit[agent] = dailyLimit;
	emit AgentLimitSet(agent, dailyLimit);
	}

	function send(address to, uint256 amount) external onlyOwner {
		require(tusd8.transfer(to, amount), "Transfer failed");
		emit Sent(to, amount);
	}
	
	function agentSend(address to, uint256 amount) external {
		address agent = msg.sender;
		_resetIfNeeded(agent);
		
		require(tusd8.transfer(to, amount), "Transfer failed");
		emit Sent(to, amount);
	}

	function getBalance() external view returns (uint256) {
		return tusd8.balanceOf(address(this));
	}
	
	// Permette di ricevere tUSD8
	function deposit(uint256 amount) external {
		require(tusd8.transferFrom(msg.sender, address(this), amount),
"Deposit failed");
		emit Received(msg.sender, amount);
	}

	function _resetIfNeeded(address agent) internal {
		if (block.timestamp >= lastReset[agent] + 1 days) {
		agentSpentToday[agent] = 0;
		lastReset[agent] = block.timestamp;
	  }
	}

}
