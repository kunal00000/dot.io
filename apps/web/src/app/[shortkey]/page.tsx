import { db } from '@/db';
import { constructMetadata } from '@/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Params {
  params: { shortkey: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { shortkey } = params;

  const link = await db.link.findUnique({
    where: { shortkey: shortkey }
  });

  if (!link) notFound();

  return constructMetadata({
    title: link.title,
    // [TODO: remove optional chaining (!)]
    description: link.description!,
    image: link.image!
  });
}

const page = () => {
  return <div>hello</div>;
};

export default page;
