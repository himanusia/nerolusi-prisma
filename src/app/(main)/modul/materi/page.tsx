import PageContent from "./page-content";

export default async function SubtestPage({
  params,
}: {
  params: Promise<{ subtest: string }>;
}) {
  const { subtest } = await params;
  return <PageContent subtest={subtest} />;
}
