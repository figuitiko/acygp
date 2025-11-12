type SectionBaseProps = {
  heading: string;
  topics: string[];
};
type SectionInfoAboutNotCTAProps = SectionBaseProps & {
  showCTA?: false;
  headingCTA?: never;
  itemsCTA?: never;
};
type SectionInfoAboutWithCTAProps = SectionBaseProps &
  CTAProps & { showCTA: true };

type SectionInfoAboutProps =
  | SectionInfoAboutNotCTAProps
  | SectionInfoAboutWithCTAProps;
import { AboutInfoBox, CTAProps } from "./about-info-box";

const { Heading, List, ListItem, CTA } = AboutInfoBox;

export const SectionInfoAbout = ({
  heading,
  topics,
  ...props
}: SectionInfoAboutProps) => {
  return (
    <div className="bg-main flex flex-col p-20 items-center justify-center text-white w-full  mx-auto shadow-lg">
      <Heading>{heading}</Heading>
      <List>
        {topics.map((topic, index) => (
          <ListItem key={index}>
            <p className="text-3xl">{topic}</p>
          </ListItem>
        ))}
      </List>
      {props.showCTA && <CTA {...props} />}
    </div>
  );
};
