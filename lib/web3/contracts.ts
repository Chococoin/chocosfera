import { type Abi } from 'viem';

// Contract addresses — populated from DeployLocal.s.sol output
export const contracts = {
  treeRegistry: process.env.NEXT_PUBLIC_TREE_REGISTRY_ADDRESS as `0x${string}`,
  referralTree: process.env.NEXT_PUBLIC_REFERRAL_TREE_ADDRESS as `0x${string}`,
  royaltySplitter: process.env.NEXT_PUBLIC_ROYALTY_SPLITTER_ADDRESS as `0x${string}`,
  mockUSDT: process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS as `0x${string}`,
  participationToken: process.env.NEXT_PUBLIC_PARTICIPATION_TOKEN_ADDRESS as `0x${string}`,
  taskManager: process.env.NEXT_PUBLIC_TASK_MANAGER_ADDRESS as `0x${string}`,
  paymentManager: process.env.NEXT_PUBLIC_PAYMENT_MANAGER_ADDRESS as `0x${string}`,
  hybridVoting: process.env.NEXT_PUBLIC_HYBRID_VOTING_ADDRESS as `0x${string}`,
  executor: process.env.NEXT_PUBLIC_EXECUTOR_ADDRESS as `0x${string}`,
  hats: process.env.NEXT_PUBLIC_HATS_ADDRESS as `0x${string}`,
} as const;

// Minimal ABIs — only functions/events used by the frontend

export const treeRegistryAbi = [
  {
    type: 'function',
    name: 'getTree',
    inputs: [{ name: 'treeId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'treeId', type: 'uint256' },
          { name: 'locationHash', type: 'bytes32' },
          { name: 'farmer', type: 'address' },
          { name: 'adopter', type: 'address' },
          { name: 'adoptedAt', type: 'uint256' },
          { name: 'lastAuditHash', type: 'bytes32' },
          { name: 'lastAuditBlock', type: 'uint256' },
          { name: 'status', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalTrees',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTreesByFarmer',
    inputs: [{ name: 'farmer', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTreesByAdopter',
    inputs: [{ name: 'adopter', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'adoptTree',
    inputs: [
      { name: 'treeId', type: 'uint256' },
      { name: 'adopter', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerTree',
    inputs: [
      { name: 'farmer', type: 'address' },
      { name: 'locationHash', type: 'bytes32' },
    ],
    outputs: [{ name: 'treeId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'TreeRegistered',
    inputs: [
      { name: 'treeId', type: 'uint256', indexed: true },
      { name: 'farmer', type: 'address', indexed: true },
      { name: 'locationHash', type: 'bytes32', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TreeAdopted',
    inputs: [
      { name: 'treeId', type: 'uint256', indexed: true },
      { name: 'adopter', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'AuditApproved',
    inputs: [
      { name: 'treeId', type: 'uint256', indexed: true },
      { name: 'approver', type: 'address', indexed: true },
      { name: 'ipfsHash', type: 'bytes32', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TreeStatusChanged',
    inputs: [
      { name: 'treeId', type: 'uint256', indexed: true },
      { name: 'newStatus', type: 'uint8', indexed: false },
    ],
  },
] as const satisfies Abi;

export const referralTreeAbi = [
  {
    type: 'function',
    name: 'referralCount',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getReferrals',
    inputs: [{ name: '_referrer', type: 'address' }],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getReferralChain',
    inputs: [
      { name: '_address', type: 'address' },
      { name: 'depth', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
] as const satisfies Abi;

export const royaltySplitterAbi = [
  {
    type: 'function',
    name: 'totalRoyalties',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'guardianCreators',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const satisfies Abi;

export const participationTokenAbi = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const satisfies Abi;

export const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const satisfies Abi;

export const hybridVotingAbi = [
  {
    type: 'function',
    name: 'proposalsCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'thresholdPct',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getProposalClasses',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'strategy', type: 'uint8' },
          { name: 'slicePct', type: 'uint8' },
          { name: 'quadratic', type: 'bool' },
          { name: 'minBalance', type: 'uint256' },
          { name: 'asset', type: 'address' },
          { name: 'hatIds', type: 'uint256[]' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'vote',
    inputs: [
      { name: 'id', type: 'uint256' },
      { name: 'idxs', type: 'uint8[]' },
      { name: 'weights', type: 'uint8[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createProposal',
    inputs: [
      { name: 'title', type: 'bytes' },
      { name: 'descriptionHash', type: 'bytes32' },
      { name: 'minutesDuration', type: 'uint32' },
      { name: 'numOptions', type: 'uint8' },
      { name: 'batches', type: 'tuple[][]', components: [{ name: 'target', type: 'address' }, { name: 'value', type: 'uint256' }, { name: 'data', type: 'bytes' }] },
      { name: 'hatIds', type: 'uint256[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'NewProposal',
    inputs: [
      { name: 'id', type: 'uint256', indexed: false },
      { name: 'title', type: 'bytes', indexed: false },
      { name: 'descriptionHash', type: 'bytes32', indexed: false },
      { name: 'numOptions', type: 'uint8', indexed: false },
      { name: 'endTs', type: 'uint64', indexed: false },
      { name: 'created', type: 'uint64', indexed: false },
    ],
  },
] as const satisfies Abi;

// Tree status enum matching Solidity
export const TreeStatus = {
  PLANTED: 0,
  GROWING: 1,
  PRODUCING: 2,
  DEAD: 3,
} as const;

export type TreeStatusType = (typeof TreeStatus)[keyof typeof TreeStatus];

export const treeStatusLabels: Record<TreeStatusType, string> = {
  [TreeStatus.PLANTED]: 'planted',
  [TreeStatus.GROWING]: 'growing',
  [TreeStatus.PRODUCING]: 'producing',
  [TreeStatus.DEAD]: 'dead',
};
