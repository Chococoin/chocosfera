import { NextResponse } from 'next/server';
import { publicClient } from '@/lib/web3/relayer';
import { contracts, hybridVotingAbi } from '@/lib/web3/contracts';
import { toHex, fromHex } from 'viem';

export async function GET() {
  try {
    // Get proposal count
    const count = await publicClient.readContract({
      address: contracts.hybridVoting,
      abi: hybridVotingAbi,
      functionName: 'proposalsCount',
    }) as bigint;

    const threshold = await publicClient.readContract({
      address: contracts.hybridVoting,
      abi: hybridVotingAbi,
      functionName: 'thresholdPct',
    }) as number;

    // Read NewProposal events to get proposal titles and metadata
    const events = await publicClient.getLogs({
      address: contracts.hybridVoting,
      event: {
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
      fromBlock: BigInt(0),
    });

    const proposals = events.map((event) => {
      const args = event.args;
      let title = 'Untitled';
      try {
        title = new TextDecoder().decode(fromHex(args.title as `0x${string}`, 'bytes'));
      } catch { /* keep default */ }

      const endTs = Number(args.endTs);
      const now = Math.floor(Date.now() / 1000);

      return {
        id: Number(args.id),
        title,
        numOptions: Number(args.numOptions),
        endTimestamp: endTs,
        createdTimestamp: Number(args.created),
        isActive: now < endTs,
        isExpired: now >= endTs,
        transactionHash: event.transactionHash,
        blockNumber: Number(event.blockNumber),
      };
    });

    return NextResponse.json({
      success: true,
      totalProposals: Number(count),
      thresholdPct: threshold,
      proposals,
    });
  } catch (error) {
    console.error('Error fetching governance data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch governance data' },
      { status: 500 }
    );
  }
}
