import { NextResponse } from 'next/server';
import { getTotalTrees, getTree, getTreesByAdopter } from '@/lib/web3/relayer';
import { treeStatusLabels, type TreeStatusType } from '@/lib/web3/contracts';
import type { Address } from 'viem';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adopter = searchParams.get('adopter') as Address | null;

    let treeIds: number[];

    if (adopter) {
      treeIds = await getTreesByAdopter(adopter);
    } else {
      const total = await getTotalTrees();
      treeIds = Array.from({ length: total }, (_, i) => i + 1);
    }

    const trees = await Promise.all(
      treeIds.map(async (id) => {
        const tree = await getTree(id);
        return {
          id: Number(tree.treeId),
          status: treeStatusLabels[tree.status as TreeStatusType] || 'unknown',
          statusCode: Number(tree.status),
          farmer: tree.farmer,
          adopter: tree.adopter,
          adoptedAt: tree.adoptedAt > BigInt(0)
            ? new Date(Number(tree.adoptedAt) * 1000).toISOString()
            : null,
          locationHash: tree.locationHash,
          lastAuditHash: tree.lastAuditHash,
          lastAuditBlock: Number(tree.lastAuditBlock),
        };
      })
    );

    return NextResponse.json({ success: true, trees, total: trees.length });
  } catch (error) {
    console.error('Error fetching trees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trees from blockchain' },
      { status: 500 }
    );
  }
}
