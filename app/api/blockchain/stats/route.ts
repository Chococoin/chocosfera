import { NextResponse } from 'next/server';
import { getTotalTrees, getTree } from '@/lib/web3/relayer';
import { publicClient } from '@/lib/web3/relayer';
import { contracts, participationTokenAbi, referralTreeAbi } from '@/lib/web3/contracts';
import type { Address } from 'viem';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet') as Address | null;

    // Read aggregate stats from blockchain
    const totalTrees = await getTotalTrees();

    // Count adopted trees and unique farmers
    let adoptedCount = 0;
    const farmers = new Set<string>();
    const zeroAddr = '0x0000000000000000000000000000000000000000';

    for (let i = 1; i <= totalTrees; i++) {
      const tree = await getTree(i);
      if (tree.adopter !== zeroAddr) adoptedCount++;
      if (tree.farmer !== zeroAddr) farmers.add(tree.farmer);
    }

    // Read PT total supply
    const totalSupply = await publicClient.readContract({
      address: contracts.participationToken,
      abi: participationTokenAbi,
      functionName: 'totalSupply',
    });

    // Per-user stats (if wallet provided)
    let userStats = null;
    if (walletAddress) {
      const [ptBalance, referralCount] = await Promise.all([
        publicClient.readContract({
          address: contracts.participationToken,
          abi: participationTokenAbi,
          functionName: 'balanceOf',
          args: [walletAddress],
        }),
        publicClient.readContract({
          address: contracts.referralTree,
          abi: referralTreeAbi,
          functionName: 'referralCount',
          args: [walletAddress],
        }),
      ]);

      userStats = {
        ptBalance: ptBalance.toString(),
        referralCount: Number(referralCount),
      };
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalTrees,
        adoptedTrees: adoptedCount,
        uniqueFarmers: farmers.size,
        co2Offset: `${(totalTrees * 0.2).toFixed(1)}`,
        ptTotalSupply: totalSupply.toString(),
      },
      userStats,
    });
  } catch (error) {
    console.error('Error fetching blockchain stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blockchain stats' },
      { status: 500 }
    );
  }
}
