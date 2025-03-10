import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const guideUuid = searchParams.get('guideUuid');
  const spaceId = searchParams.get('spaceId');
  if (!guideUuid) return NextResponse.json({ body: 'No guideUuid provided' }, { status: 400 });
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });

  const guideRatings = await prisma.guideRating.findMany({
    where: {
      NOT: {
        endRating: null,
      },
      guideUuid: guideUuid,
      spaceId: spaceId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 200,
  });

  return NextResponse.json({ guideRatings }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
