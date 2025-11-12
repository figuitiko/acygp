import React from "react";

interface AboutInfoBoxProps {
  children: React.ReactNode;
  className?: string;
}

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
}

interface ListProps {
  children: React.ReactNode;
  className?: string;
}

interface ListItemProps {
  children: React.ReactNode;
  className?: string;
}
export type itemCTA = {
  title: string;
  email: string;
};

export interface CTAProps {
  headingCTA: string;
  itemsCTA: itemCTA[];
  className?: string;
}

const AboutInfoBox = ({ children, className = "" }: AboutInfoBoxProps) => {
  return <div className={`about-info-box ${className}`}>{children}</div>;
};

const Heading = ({ children, className = "" }: HeadingProps) => {
  return <h2 className={`text-5xl font-bold mb-4 ${className}`}>{children}</h2>;
};

const List = ({ children, className = "" }: ListProps) => {
  return (
    <ul className={`list-disc pl-6 space-y-2 ${className}`}>{children}</ul>
  );
};

const ListItem = ({ children, className = "" }: ListItemProps) => {
  return <li className={className}>{children}</li>;
};

const CTA = ({ headingCTA, itemsCTA, className = "" }: CTAProps) => {
  return (
    <div className="flex flex-col p-12 gap-8 items-center justify-center w-full">
      <h3 className="bg-white text-main text-3xl p-6 font-bold">
        {headingCTA}
      </h3>
      <div
        className={`flex justify-between gap-4 mt-2 w-full max-w-4xl ${className}`}
      >
        {itemsCTA.map((item, index) => (
          <div key={index} className="flex flex-col">
            <span className="font-semibold text-3xl">{item.title}</span>
            <a
              href={`mailto:${item.email}`}
              className="text-3xl  hover:underline"
            >
              {item.email}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

AboutInfoBox.Heading = Heading;
AboutInfoBox.List = List;
AboutInfoBox.ListItem = ListItem;
AboutInfoBox.CTA = CTA;

export { AboutInfoBox };
