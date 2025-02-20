import { ProjectDetails } from '@/types/project/project';
import { InsightsConstants } from '@/util/insights-constants';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: process.env.DEFAULT_REGION });

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }): Promise<{ projectDetails: ProjectDetails }> {
  const { projectId } = await params;

  const key = `${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/${projectId}/agent-status.json`;

  // Fetch the `agent-status.json` file from S3
  const command = new GetObjectCommand({
    Bucket: InsightsConstants.S3_BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);

  const body = response.Body instanceof Readable ? await streamToString(response.Body) : await new Response(response.Body as ReadableStream).text();
  const projectDetails = JSON.parse(body);

  return {
    projectDetails: projectDetails,
  };
}

export const GET = withErrorHandlingV2<{ projectDetails: ProjectDetails }>(getHandler);
