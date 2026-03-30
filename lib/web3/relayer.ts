/**
 * Server-side blockchain relayer
 * Uses viem directly — NEVER import this in 'use client' files
 *
 * The relayer holds the Guardian hat and executes on-chain operations
 * on behalf of users (gasless from user perspective).
 */
import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { anvilLocal } from './config';
import { contracts, treeRegistryAbi, type TreeStatusType } from './contracts';

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';

// Public client for reads (no private key needed)
export const publicClient = createPublicClient({
  chain: anvilLocal,
  transport: http(rpcUrl),
});

// Wallet client for writes (requires RELAYER_PRIVATE_KEY)
function getRelayerClient() {
  const pk = process.env.RELAYER_PRIVATE_KEY;
  if (!pk) throw new Error('RELAYER_PRIVATE_KEY not set');
  const account = privateKeyToAccount(pk as `0x${string}`);
  return createWalletClient({
    account,
    chain: anvilLocal,
    transport: http(rpcUrl),
  });
}

// ═══ READ FUNCTIONS ═══

export interface OnChainTree {
  treeId: bigint;
  locationHash: `0x${string}`;
  farmer: Address;
  adopter: Address;
  adoptedAt: bigint;
  lastAuditHash: `0x${string}`;
  lastAuditBlock: bigint;
  status: TreeStatusType;
}

export async function getTree(treeId: number): Promise<OnChainTree> {
  const result = await publicClient.readContract({
    address: contracts.treeRegistry,
    abi: treeRegistryAbi,
    functionName: 'getTree',
    args: [BigInt(treeId)],
  });
  return result as unknown as OnChainTree;
}

export async function getTotalTrees(): Promise<number> {
  const result = await publicClient.readContract({
    address: contracts.treeRegistry,
    abi: treeRegistryAbi,
    functionName: 'totalTrees',
  });
  return Number(result);
}

export async function getTreesByAdopter(adopter: Address): Promise<number[]> {
  const result = await publicClient.readContract({
    address: contracts.treeRegistry,
    abi: treeRegistryAbi,
    functionName: 'getTreesByAdopter',
    args: [adopter],
  });
  return (result as bigint[]).map(Number);
}

export async function getParticipationTokenBalance(address: Address): Promise<bigint> {
  const { participationTokenAbi } = await import('./contracts');
  return await publicClient.readContract({
    address: contracts.participationToken,
    abi: participationTokenAbi,
    functionName: 'balanceOf',
    args: [address],
  }) as bigint;
}

export async function getUSDTBalance(address: Address): Promise<bigint> {
  const { erc20Abi } = await import('./contracts');
  return await publicClient.readContract({
    address: contracts.mockUSDT,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  }) as bigint;
}

// ═══ WRITE FUNCTIONS (relayer) ═══

export async function relayAdoptTree(treeId: number, adopter: Address): Promise<`0x${string}`> {
  const client = getRelayerClient();
  const hash = await client.writeContract({
    address: contracts.treeRegistry,
    abi: treeRegistryAbi,
    functionName: 'adoptTree',
    args: [BigInt(treeId), adopter],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function relayRegisterTree(farmer: Address, locationHash: `0x${string}`): Promise<`0x${string}`> {
  const client = getRelayerClient();
  const hash = await client.writeContract({
    address: contracts.treeRegistry,
    abi: treeRegistryAbi,
    functionName: 'registerTree',
    args: [farmer, locationHash],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

// ═══ EVENT READING ═══

export async function getTreeEvents(treeId: number) {
  const treeIdBigInt = BigInt(treeId);

  const [adopted, audits, statusChanges] = await Promise.all([
    publicClient.getLogs({
      address: contracts.treeRegistry,
      event: {
        type: 'event',
        name: 'TreeAdopted',
        inputs: [
          { name: 'treeId', type: 'uint256', indexed: true },
          { name: 'adopter', type: 'address', indexed: true },
        ],
      },
      args: { treeId: treeIdBigInt },
      fromBlock: BigInt(0),
    }),
    publicClient.getLogs({
      address: contracts.treeRegistry,
      event: {
        type: 'event',
        name: 'AuditApproved',
        inputs: [
          { name: 'treeId', type: 'uint256', indexed: true },
          { name: 'approver', type: 'address', indexed: true },
          { name: 'ipfsHash', type: 'bytes32', indexed: false },
        ],
      },
      args: { treeId: treeIdBigInt },
      fromBlock: BigInt(0),
    }),
    publicClient.getLogs({
      address: contracts.treeRegistry,
      event: {
        type: 'event',
        name: 'TreeStatusChanged',
        inputs: [
          { name: 'treeId', type: 'uint256', indexed: true },
          { name: 'newStatus', type: 'uint8', indexed: false },
        ],
      },
      args: { treeId: treeIdBigInt },
      fromBlock: BigInt(0),
    }),
  ]);

  return { adopted, audits, statusChanges };
}
