// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SimpleWallet.sol";

contract DeployWallet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address tusd8 = 0x456569838f1d43009A91ebA4263147Afd7233483;

        vm.startBroadcast(deployerPrivateKey);

        SimpleWallet wallet = new SimpleWallet(tusd8);

        vm.stopBroadcast();

        console.log("Wallet deployed at:", address(wallet));
    }
}
