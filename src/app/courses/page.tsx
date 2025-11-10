import { HeroCourses } from "@/components/courses/hero-courses";
import { MainWrapperSpacer } from "@/components/share/main-wrapper-spacer";

const CoursesPage = () => {
  return (
    <MainWrapperSpacer>
      <HeroCourses
        heading="Catálogo de cursos"
        headingInfo="Our team of creatives"
        subHeadingInfo="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
        descriptionInfo="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat."
        imgSrc="/images/courses/courses-hero.webp"
      />
    </MainWrapperSpacer>
  );
};

export default CoursesPage;
