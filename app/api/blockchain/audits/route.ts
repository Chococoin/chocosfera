import { NextResponse } from 'next/server';
import { getTreeEvents } from '@/lib/web3/relayer';
import { treeStatusLabels, type TreeStatusType } from '@/lib/web3/contracts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const treeId = searchParams.get('treeId');

    if (!treeId) {
      return NextResponse.json(
        { success: false, error: 'treeId parameter required' },
        { status: 400 }
      );
    }

    const events = await getTreeEvents(Number(treeId));

    const timeline = [
      ...events.adopted.map((e) => ({
        type: 'adopted' as const,
        blockNumber: Number(e.blockNumber),
        transactionHash: e.transactionHash,
        adopter: e.args.adopter,
      })),
      ...events.audits.map((e) => ({
        type: 'audit_approved' as const,
        blockNumber: Number(e.blockNumber),
        transactionHash: e.transactionHash,
        approver: e.args.approver,
        ipfsHash: e.args.ipfsHash,
      })),
      ...events.statusChanges.map((e) => ({
        type: 'status_changed' as const,
        blockNumber: Number(e.blockNumber),
        transactionHash: e.transactionHash,
        newStatus: treeStatusLabels[Number(e.args.newStatus) as TreeStatusType],
      })),
    ].sort((a, b) => a.blockNumber - b.blockNumber);

    return NextResponse.json({ success: true, timeline });
  } catch (error) {
    console.error('Error fetching audit events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events from blockchain' },
      { status: 500 }
    );
  }
}
