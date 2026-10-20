import { notFound } from "next/navigation";
import { componentTests } from "@/components/component-tests/registry";

export default async function ComponentTestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const test = componentTests.find((item) => item.slug === slug);

  if (!test) {
    notFound();
  }

  const Component = test.component;

  return <Component />;
}
