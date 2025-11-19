type Props = {
  items: { title: string; content: string; id: number }[];
};

export const AccordionServices = ({ items }: Props) => {
  return (
    <div className="w-full mx-auto">
      {items.map((item) => (
        <details
          key={item.id}
          className="mb-0.5 border border-main  text-white"
        >
          <summary className="cursor-pointer w-full text-center p-4 bg-main font-semibold  flex justify-center  hover:bg-main/50 ">
            {item.title}
          </summary>
          <div className="p-4 pt-0 text-main text-center">{item.content}</div>
        </details>
      ))}
    </div>
  );
};
