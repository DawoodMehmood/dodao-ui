import { dodaoTeamMates, getDecodedJwtFromContext } from '@/app/api/helpers/permissions/getJwtFromContext';
import { isDoDAOSuperAdmin, isSuperAdminOfDoDAO } from '@/app/api/helpers/space/isSuperAdmin';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { RubricSpace } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

/**
 * @deprecated - see dodaoTeamMates in getJwtFromContext.ts. That already checks for it.
 *               May be this is not needed anymore.?
 *
 * @param context
 */
async function isDoDAOMember(context: NextRequest): Promise<(JwtPayload & DoDaoJwtTokenPayload) | null> {
  const decoded = await getDecodedJwtFromContext(context);
  if (dodaoTeamMates.map((u) => u.toLowerCase()).includes(decoded!.username.toLowerCase())) {
    return decoded;
  }
  return null;
}

export function isUserAdminOfSpace(username: string, space: RubricSpace) {
  const spaceAdmins = [space.creator?.toLowerCase()];
  const isAdminOfSpace: boolean = spaceAdmins.includes(username.toLowerCase());

  const isAdminOfSpaceByUserName: boolean = space.adminUsernamesV1?.map((u: any) => u.toLowerCase()).includes(username.toLowerCase());
  const isAdminOfSpaceByUserNameByName: boolean = space.adminUsernamesV1?.map((u) => u.username.toLowerCase()).includes(username.toLowerCase());

  return isAdminOfSpace || isAdminOfSpaceByUserName || isSuperAdminOfDoDAO(username) || isAdminOfSpaceByUserNameByName;
}
export async function isRequestUserSuperAdmin(req: NextRequest): Promise<boolean> {
  const decoded = await getDecodedJwtFromContext(req);
  return !!(decoded?.username && isDoDAOSuperAdmin(decoded.username));
}
export async function canEditGitSpace(context: NextRequest, space: RubricSpace) {
  const doDAOMember = await isDoDAOMember(context);

  if (doDAOMember && space.id === 'test-academy-eth') {
    return { decodedJWT: doDAOMember, canEditSpace: true, user: doDAOMember.accountId.toLowerCase() };
  }

  const isCreator =
    space.creator.toLowerCase() === (await getDecodedJwtFromContext(context))?.username.toLowerCase() ||
    space.creator.toLowerCase() === (await getDecodedJwtFromContext(context))?.accountId.toLowerCase();

  if (isCreator) {
    return {
      decodedJWT: await getDecodedJwtFromContext(context),
      canEditSpace: true,
      user: (await getDecodedJwtFromContext(context))?.accountId.toLowerCase(),
    };
  }

  const decoded = await getDecodedJwtFromContext(context);
  const doDAOAdmin = isDoDAOSuperAdmin(decoded!.username);

  if (doDAOAdmin) {
    return { decodedJWT: decoded, canEditSpace: true, user: decoded?.accountId.toLowerCase() };
  }

  const decodedJWT = await getDecodedJwtFromContext(context);

  return { decodedJWT, canEditSpace: isUserAdminOfSpace(decodedJWT!.username, space), username: decodedJWT?.accountId.toLowerCase() };
}

export async function checkEditSpacePermission(space: RubricSpace, req: NextRequest): Promise<(JwtPayload & DoDaoJwtTokenPayload) | null> {
  const { decodedJWT, canEditSpace } = await canEditGitSpace(req, space);

  if (!canEditSpace) {
    throw new Error(
      'Not allowed to edit space :' +
        JSON.stringify({
          decodedJWT,
        })
    );
  }

  return decodedJWT;
}

export function checkSpaceIdAndSpaceInEntityAreSame(spaceId: string, entitySpaceId: string) {
  if (entitySpaceId !== spaceId) {
    throw new Error('Space id and entity space id are not same - ' + spaceId + ' - ' + entitySpaceId);
  }
}
