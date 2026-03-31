import { NextResponse } from 'next/server';
import { publicClient } from '@/lib/web3/relayer';
import { contracts, royaltySplitterAbi } from '@/lib/web3/contracts';
import { formatUnits } from 'viem';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.getAll('ids').map(Number).filter((n) => !isNaN(n));

    if (ids.length === 0) {
      return NextResponse.json({ success: true, royalties: [] });
    }

    const royalties = await Promise.all(
      ids.map(async (guardianId) => {
        const [totalRaw, creator] = await Promise.all([
          publicClient.readContract({
            address: contracts.royaltySplitter,
            abi: royaltySplitterAbi,
            functionName: 'totalRoyalties',
            args: [BigInt(guardianId)],
          }),
          publicClient.readContract({
            address: contracts.royaltySplitter,
            abi: royaltySplitterAbi,
            functionName: 'guardianCreators',
            args: [BigInt(guardianId)],
          }),
        ]);

        const total = totalRaw as bigint;
        const creatorAddress = creator as string;
        const totalFormatted = formatUnits(total, 6);
        const creatorShare = formatUnits((total * BigInt(3000)) / BigInt(10000), 6);
        const poolShare = formatUnits(total - (total * BigInt(3000)) / BigInt(10000), 6);

        return {
          guardianId,
          totalRoyalties: totalFormatted,
          creatorAddress,
          creatorShare,
          poolShare,
          isRegistered: creatorAddress !== ZERO_ADDRESS,
        };
      })
    );

    return NextResponse.json({ success: true, royalties });
  } catch (error) {
    console.error('Error fetching guardian royalties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch royalties' },
      { status: 500 }
    );
  }
}
