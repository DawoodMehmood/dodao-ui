import { prisma } from '@/prisma';
import { createHash } from '@dodao/web-core/api/auth/createHash';
import { defaultNormalizer, randomString, sendVerificationRequest } from '@dodao/web-core/api/auth/custom-email/send-verification';
import { BaseUser } from '@prisma/client';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const createUser = async (user: BaseUser & { email: string }, spaceId: string) => {
  console.log('######### signIn - Creating new user #########');
  const upsertedUser = await prisma.baseUser.upsert({
    create: {
      spaceId,
      email: user.email,
      emailVerified: new Date(),
      authProvider: 'email',
      username: user.email,
    },
    update: {
      emailVerified: new Date(),
    },
    where: {
      email_spaceId: {
        email: user.email,
        spaceId,
      },
    },
  });

  await prisma.account.upsert({
    create: {
      type: 'credentials',
      provider: 'custom-email',
      providerAccountId: user.email,
      userId: upsertedUser.id,
    },
    update: {},
    where: {
      provider_providerAccountId: {
        provider: 'custom-email',
        providerAccountId: user.email,
      },
    },
  });
};
/**
 * Starts an e-mail login flow, by generating a token,
 * and sending it to the user's e-mail (with the help of a DB adapter).
 * At the end, it returns a redirect to the `verify-request` page.
 */
async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { spaceId, provider, email } = reqBody;

  console.log('######### send-verification - POST #########');
  console.log('request', JSON.stringify(reqBody));

  console.log('request', JSON.stringify(req.cookies.getAll()));

  const normalizer = defaultNormalizer;
  const userEmail = normalizer(email);

  const defaultUser = { id: crypto.randomUUID(), email: userEmail, emailVerified: null };
  const user = ((await prisma.baseUser.findUnique({ where: { email_spaceId: { email: userEmail, spaceId } } })) ?? defaultUser) as BaseUser & { email: string };

  console.log('user', user);
  await createUser(user, spaceId);

  const token = randomString(32);

  const ONE_DAY_IN_SECONDS = 86400;
  const expires = new Date(Date.now() + ONE_DAY_IN_SECONDS * 1000 * 30); // 30 days

  const headersList = await headers();

  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const httpsProto = headersList.get('x-forwarded-proto');
  // Do whatever you want here, before the request is passed down to `NextAuth`

  const baseUrl = `${httpsProto}://${host}`;

  const url = `${baseUrl}/auth/email/verify?${new URLSearchParams({
    token,
  })}`;
  console.log('url', url);
  await sendVerificationRequest({
    identifier: userEmail,
    token,
    expires,
    url: url,
  });

  const data = {
    identifier: userEmail,
    token: await createHash(`${token}${process.env.EMAIL_TOKEN_SECRET!}`),
    expires,
  };
  await prisma.verificationToken.create({ data });

  return NextResponse.json({});
}

export { POST };
