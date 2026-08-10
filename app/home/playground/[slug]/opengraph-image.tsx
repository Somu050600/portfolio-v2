import { createOgImage } from "@/lib/og-card";
import { getOgImageMetadata, getOgInputForPath } from "@/lib/og";
import { getLiveExperimentSlugs } from "@/lib/playground.config";

type ImageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getLiveExperimentSlugs().map((slug) => ({ slug }));
}

export function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const input = getOgInputForPath(`/home/playground/${params.slug}`);
  return input ? getOgImageMetadata(input) : [];
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const input = getOgInputForPath(`/home/playground/${slug}`) ?? {
    template: "band" as const,
    kicker: "PLAYGROUND",
    title: "Playground",
    index: "00",
  };

  return createOgImage(input);
}
