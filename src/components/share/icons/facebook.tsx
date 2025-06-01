type Props = React.SVGProps<SVGSVGElement> & {
  color?: string;
  width?: number;
  height?: number;
};
export const FacebookIcon = ({
  color = "#fff",
  width = 32,
  height = 29,
  ...props
}: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        fill={color}
        d="M15.8.5c-8.836 0-16 6.716-16 15 0 7.034 5.167 12.937 12.136 14.558v-9.974h-3.3V15.5h3.3v-1.975c0-5.106 2.464-7.472 7.811-7.472 1.014 0 2.763.187 3.478.373v4.155c-.377-.038-1.033-.056-1.848-.056-2.623 0-3.637.932-3.637 3.354V15.5h5.226l-.898 4.584H17.74V30.39c7.923-.897 14.061-7.22 14.061-14.89 0-8.284-7.164-15-16-15Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill={color} d="M-.2.5h32v30h-32z" />
      </clipPath>
    </defs>
  </svg>
);
