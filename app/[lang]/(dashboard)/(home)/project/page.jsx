import { getDictionary } from "@/app/dictionaries";
import ProjectPageView from "./page-view";

const ProjectPage = async ({ params }) => {
  const { lang } = await params;
  const trans = await getDictionary(lang);
  return <ProjectPageView trans={trans} />;
};

export default ProjectPage;
