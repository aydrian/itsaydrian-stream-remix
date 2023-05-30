type LogoProps = {
  className?: string;
  title?: string;
  variant?: "light" | "dark" | "1color";
};

export function Stacked({
  className,
  title = "Cockroach Labs",
  variant = "1color"
}: LogoProps) {
  if (variant !== "1color") {
    return <div className={className}>Not Implemented</div>;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 129 101"
      className={className}
    >
      <title>{title}</title>
      <path
        d="M36.06 97.25h8.45v2.28H33.37V80.45h2.69v16.8zM76 92.34c0 4.56-2.7 7.57-6.35 7.57a5.37 5.37 0 0 1-4.92-2.54v2.16h-2.37V80.45h2.52v6.71a5.38 5.38 0 0 1 4.77-2.4c3.71 0 6.35 3.01 6.35 7.58zm-2.58 0c0-3.25-1.64-5.45-4.15-5.45-2.51 0-4.48 2-4.48 5.45s1.9 5.41 4.48 5.41c2.58 0 4.15-2.17 4.15-5.41zM53.23 84.73a9.71 9.71 0 0 0-5.83 2.16v2.61c1.18-1 3.39-2.69 5.91-2.69a3.68 3.68 0 0 1 2.63.91 2.5 2.5 0 0 1 .51.75 1.571 1.571 0 0 1-1.17 2.16l-1.82.37c-3.6.64-6.7 1.64-6.7 5 0 2.87 2.34 4 5.15 4a5.62 5.62 0 0 0 4.89-2.25v1.78h2.28v-10c0-2.81-2.08-4.8-5.85-4.8zm3.45 7.39v2c0 2.37-2 3.77-4.51 3.77-1.84 0-3-.73-3-2a2.058 2.058 0 0 1 .61-1.54c1.48-1.45 5.71-1.42 6.9-2.23zM84.51 91.05c-2.63-.59-3.86-.88-3.86-2.14 0-1.26 1.2-2.13 3.16-2.13 1.73 0 2.9.45 5.24 2.2v-2.64a8.3 8.3 0 0 0-5.24-1.61c-3.34 0-5.59 1.76-5.59 4.27s1.4 3.25 5.24 4.07c2.31.49 4 .93 4 2.51 0 1.58-1.4 2.28-3.27 2.28s-2.93-.54-5.76-2.63V98a8.621 8.621 0 0 0 5.74 1.94c3.48 0 5.76-1.81 5.76-4.47 0-2.66-1.68-3.57-5.42-4.42zM31.58 69.26c0 4.51-2.93 7.61-7.11 7.61s-7.14-3.1-7.14-7.61 2.93-7.6 7.14-7.6c4.21 0 7.11 3.1 7.11 7.6zm-11.67 0c0 3.25 1.78 5.5 4.56 5.5 2.78 0 4.53-2.25 4.53-5.5s-1.75-5.5-4.53-5.5c-2.78 0-4.56 2.24-4.56 5.5zM70.15 64.45a6.624 6.624 0 0 0-1.91-.31c-1.93 0-3.36 1.67-3.36 4.6v7.72h-2.52V62.07h2.37v2.16a3.9 3.9 0 0 1 3.57-2.4 4.19 4.19 0 0 1 1.85.35v2.27zM85.21 69.26c0 4.51-2.92 7.61-7.11 7.61s-7.1-3.1-7.1-7.61 2.92-7.6 7.13-7.6 7.08 3.1 7.08 7.6zm-11.67 0c0 3.25 1.79 5.5 4.56 5.5 2.77 0 4.54-2.25 4.54-5.5s-1.76-5.5-4.54-5.5c-2.78 0-4.56 2.24-4.56 5.5zM93.91 61.66a9.64 9.64 0 0 0-5.83 2.16v2.6c1.18-1 3.39-2.69 5.92-2.69a3.63 3.63 0 0 1 2.62.92c.217.215.39.47.51.75A1.572 1.572 0 0 1 96 67.56l-1.83.33c-3.6.64-6.7 1.64-6.7 5 0 2.87 2.34 4 5.15 4a5.59 5.59 0 0 0 4.89-2.26v1.79h2.28v-10c-.03-2.77-2.08-4.76-5.88-4.76zm3.45 7.39v2c0 2.37-2 3.77-4.51 3.77-1.84 0-2.95-.73-2.95-2a2.08 2.08 0 0 1 .61-1.54c1.43-1.45 5.66-1.43 6.85-2.23zM128.54 66.6v9.86H126v-9.07c0-2.37-1.17-3.6-3.31-3.6a3.669 3.669 0 0 0-3.69 3.75v8.92h-2.52V57.38H119v6.33a5.18 5.18 0 0 1 4.38-2.05c3.49 0 5.16 2.25 5.16 4.94zM44.51 73.33a7.41 7.41 0 0 1-3.76 1.24c-3.76 0-4.41-3.93-4.41-5.34 0-.78.26-5.31 4.52-5.31a8.54 8.54 0 0 1 3.65.94v-2.28a7.788 7.788 0 0 0-3.77-1c-4.43 0-7 3.61-7 7.49 0 6.73 5 7.76 6.88 7.76a7.58 7.58 0 0 0 3.88-1l.01-2.5zM113.35 73.33a7.363 7.363 0 0 1-3.75 1.24c-3.77 0-4.41-3.93-4.41-5.34 0-.78.26-5.31 4.52-5.31a8.472 8.472 0 0 1 3.64.94v-2.28a7.76 7.76 0 0 0-3.76-1c-4.43 0-7 3.61-7 7.49 0 6.73 5 7.76 6.87 7.76a7.53 7.53 0 0 0 3.88-1l.01-2.5zM57.57 76.46h2.81l-5.78-8.65a24.931 24.931 0 0 0 3.57-5.74h-2.76a22 22 0 0 1-5.24 6.73V57.38h-2.52v19.08h2.52V72A25.137 25.137 0 0 0 53 69.56l4.57 6.9zM9 74.43c-6.46 0-6.36-6.74-6.36-7.52 0-7.18 5.43-7.38 6.58-7.38a8.42 8.42 0 0 1 5.71 2.27v-2.93A9.77 9.77 0 0 0 9.23 57C5.8 57 0 59.09 0 66.91a12.28 12.28 0 0 0 1.52 5.83A8.16 8.16 0 0 0 9 76.86a9.19 9.19 0 0 0 5.93-2.08v-2.92c-2.15 1.68-3.3 2.57-5.93 2.57zM75 30.73a24.78 24.78 0 0 0-8.51-25.28A22.2 22.2 0 0 1 81.93 3l.61-2.5a25.14 25.14 0 0 0-5-.5 24.6 24.6 0 0 0-13.27 3.86A24.58 24.58 0 0 0 51 0c-1.68 0-3.354.167-5 .5l.61 2.5a22.2 22.2 0 0 1 15.44 2.5 24.75 24.75 0 0 0 1.51 39.71l.71.49.71-.49A24.82 24.82 0 0 0 75 30.73zM63 41.57a22.259 22.259 0 0 1-6.68-23.46A25.118 25.118 0 0 0 61 23.77a6.05 6.05 0 0 1 2 4.53v13.27zm1.27-18.37a22.19 22.19 0 0 1-4.45-4.42 6.14 6.14 0 0 1 0-7.43 22.08 22.08 0 0 1 4.46-4.44 22.46 22.46 0 0 1 4.52 4.51 6.09 6.09 0 0 1 0 7.29 22.058 22.058 0 0 1-4.53 4.49zm1.26 18.37V28.3a6.05 6.05 0 0 1 2-4.53 25.12 25.12 0 0 0 4.67-5.66 22.002 22.002 0 0 1 1 6.64 22.24 22.24 0 0 1-7.67 16.82z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FullHorizontal({
  className,
  title = "Cockroach Labs",
  variant = "1color"
}: LogoProps) {
  if (variant !== "1color") {
    return <div className={className}>Not Implemented</div>;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 301 43"
      className={className}
    >
      <title>{title}</title>
      <path
        d="M85.5 24.25c0 5.88-3.82 9.93-9.29 9.93-5.47 0-9.32-4.05-9.32-9.93s3.82-9.94 9.32-9.94 9.29 4.05 9.29 9.94zm-15.25 0c0 4.24 2.33 7.18 6 7.18s5.93-2.94 5.93-7.18-2.3-7.19-5.93-7.19-6 2.94-6 7.19zM135.89 18a9.197 9.197 0 0 0-2.49-.39c-2.52 0-4.4 2.18-4.4 6v10.04h-3.28V14.84h3.09v2.83a5.083 5.083 0 0 1 4.66-3.14 5.29 5.29 0 0 1 2.41.47l.01 3zM155.57 24.25c0 5.88-3.82 9.93-9.29 9.93-5.47 0-9.28-4.05-9.28-9.93s3.82-9.94 9.32-9.94 9.25 4.05 9.25 9.94zm-15.25 0c0 4.24 2.33 7.18 6 7.18s5.92-2.94 5.92-7.18-2.29-7.19-5.92-7.19-6 2.94-6 7.19zM166.93 14.31a12.63 12.63 0 0 0-7.62 2.83v3.4c1.54-1.25 4.43-3.54 7.69-3.54a4.75 4.75 0 0 1 3.43 1.2c.285.286.509.626.66 1a1.997 1.997 0 0 1-.645 2.448c-.248.18-.534.3-.835.352l-2.38.43c-4.7.84-8.75 2.14-8.75 6.53 0 3.75 3.06 5.28 6.73 5.28 2.82 0 5.12-1 6.38-2.94v2.33h3V20.58c-.02-3.67-2.7-6.27-7.66-6.27zm4.51 9.69v2.64c0 3.1-2.64 4.93-5.89 4.93-2.41 0-3.86-.95-3.86-2.67a2.68 2.68 0 0 1 .8-2c1.87-1.9 7.4-1.9 8.95-2.9zM212.17 20.77v12.88h-3.28V21.8c0-3.1-1.53-4.7-4.32-4.7a4.8 4.8 0 0 0-4.86 4.9v11.65h-3.28V8.72h3.28V17a6.839 6.839 0 0 1 5.74-2.67c4.55-.02 6.72 2.92 6.72 6.44zM229.6 30.67h11v3h-14.52V8.72h3.52v21.95zM281.77 24.25c0 6-3.52 9.89-8.29 9.89a7.002 7.002 0 0 1-6.42-3.32v2.83H264V8.72h3.29v8.76a6.998 6.998 0 0 1 6.23-3.13c4.81 0 8.25 3.93 8.25 9.9zm-3.36 0c0-4.25-2.14-7.11-5.43-7.11-3.29 0-5.85 2.63-5.85 7.11s2.49 7.07 5.85 7.07c3.36 0 5.43-2.83 5.43-7.07zM102.39 29.55a9.64 9.64 0 0 1-4.9 1.63c-4.93 0-5.77-5.13-5.77-7 0-1 .34-6.94 5.91-6.94 1.659.05 3.285.47 4.76 1.23v-3a10.161 10.161 0 0 0-4.92-1.28c-5.79 0-9.13 4.73-9.13 9.79 0 8.79 6.57 10.14 9 10.14a9.91 9.91 0 0 0 5.07-1.34l-.02-3.23zM192.33 29.55a9.64 9.64 0 0 1-4.9 1.63c-4.92 0-5.76-5.13-5.76-7 0-1 .34-6.94 5.9-6.94 1.658.05 3.285.47 4.76 1.23v-3a10.131 10.131 0 0 0-4.91-1.28c-5.8 0-9.14 4.73-9.14 9.79 0 8.79 6.57 10.14 9 10.14a9.911 9.911 0 0 0 5.07-1.34l-.02-3.23zM119.45 33.65h3.67l-7.55-11.3a31.723 31.723 0 0 0 4.66-7.51h-3.58a28.644 28.644 0 0 1-6.85 8.8V8.72h-3.3v24.93h3.29v-5.88a32.556 32.556 0 0 0 3.68-3.14l5.98 9.02zM252 14.31a12.609 12.609 0 0 0-7.61 2.83v3.4c1.61-1.25 4.45-3.54 7.75-3.54a4.71 4.71 0 0 1 3.42 1.2c.287.286.515.626.67 1a2.003 2.003 0 0 1-.673 2.46 1.998 1.998 0 0 1-.847.34l-2.38.43c-4.7.84-8.75 2.14-8.75 6.53 0 3.75 3.06 5.28 6.72 5.28 2.83 0 5.13-1 6.39-2.94v2.33h3V20.58c-.02-3.67-2.69-6.27-7.69-6.27zm4.53 9.69v2.64c0 3.1-2.63 4.93-5.88 4.93-2.41 0-3.86-.95-3.86-2.67a2.704 2.704 0 0 1 .79-2c1.88-1.9 7.42-1.9 8.95-2.9zM292.89 22.56c-3.44-.76-5-1.14-5-2.79 0-1.65 1.52-2.77 4.11-2.77 2.27 0 3.79.6 6.86 2.88v-3.47a10.891 10.891 0 0 0-6.86-2.1c-4.35 0-7.29 2.29-7.29 5.58 0 3.13 1.83 4.24 6.84 5.31 3 .65 5.27 1.22 5.27 3.29 0 1.87-1.83 3-4.28 3s-3.86-.73-7.54-3.49v3.62a11.258 11.258 0 0 0 7.49 2.54c4.55 0 7.53-2.37 7.53-5.85-.02-3.31-2.24-4.64-7.13-5.75zM56 31c-8.43 0-8.3-8.81-8.3-9.83 0-9.38 7.09-9.65 8.59-9.65a11 11 0 0 1 7.47 3v-3.85a12.77 12.77 0 0 0-7.46-2.44c-4.48 0-12.06 2.72-12.06 12.94a16.09 16.09 0 0 0 2 7.62A10.67 10.67 0 0 0 56 34.17a12 12 0 0 0 7.76-2.72v-3.81C61 29.83 59.44 31 56 31zM27 28.6a23 23 0 0 0-7.93-23.52 20.53 20.53 0 0 1 10.29-2.74 21.3 21.3 0 0 1 4.08.4L34 .47a23.09 23.09 0 0 0-17 3.12A22.9 22.9 0 0 0 4.65 0C3.088 0 1.53.157 0 .47l.57 2.27a21.22 21.22 0 0 1 4.08-.4 20.53 20.53 0 0 1 10.29 2.74 23 23 0 0 0 1.4 37l.66.45.66-.45A23 23 0 0 0 27 28.6zM15.83 38.69a20.73 20.73 0 0 1-6.22-21.84A23.186 23.186 0 0 0 14 22.12a5.66 5.66 0 0 1 1.87 4.22l-.04 12.35zM17 21.59a20.668 20.668 0 0 1-4.14-4.11 5.72 5.72 0 0 1 0-6.92A20.82 20.82 0 0 1 17 6.43a20.69 20.69 0 0 1 4.21 4.2 5.65 5.65 0 0 1 0 6.78A20.797 20.797 0 0 1 17 21.59zm1.17 17.1V26.34A5.699 5.699 0 0 1 20 22.12a22.927 22.927 0 0 0 4.35-5.27 20.66 20.66 0 0 1-6.22 21.84h.04z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Shorthand({
  className,
  title = "Cockroach Labs",
  variant = "1color"
}: LogoProps) {
  if (variant !== "1color") {
    return <div className={className}>Not Implemented</div>;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 80 80"
      className={className}
    >
      <title>{title}</title>
      <g fill="currentColor" clip-path="url(#a)">
        <path d="M36.1 43c-2.2-2-4.1-4.3-5.7-6.9l-.2-.3-.1.3c-.8 2.6-1.2 5.4-1.2 8.2 0 7.9 3.5 15.5 9.5 20.7l.3.2V48.6c-.1-2.1-1-4.2-2.6-5.6ZM43.9 43c-1.6 1.4-2.5 3.5-2.5 5.7v16.6l.3-.2c6-5.2 9.5-12.7 9.5-20.7 0-2.8-.4-5.5-1.2-8.2l-.1-.3-.2.3C48 38.7 46.1 41 43.9 43Z" />
        <path d="M40 0C17.9 0 0 17.9 0 40s17.9 40 40 40 40-17.9 40-40S62.1 0 40 0Zm21.5 17.5c-1.7-.3-3.5-.5-5.2-.5-4.8 0-9.5 1.3-13.6 3.6l-.2.1.2.1C49.9 26.5 54 35.1 54 44.3c0 2.5-.3 4.9-.9 7.3C51.3 58.7 47 65 40.9 69.2l-.9.5-.8-.5c-8.2-5.7-13.1-15-13.1-24.9 0-9.2 4.1-17.7 11.3-23.5l.2-.1-.2-.1c-4.1-2.4-8.8-3.6-13.6-3.6-1.8 0-3.5.2-5.2.5l-.7-2.7c1.9-.4 3.9-.6 5.9-.6 5.7 0 11.3 1.6 16.2 4.7l.1.1.1-.1c4.8-3.1 10.4-4.7 16.2-4.7 2 0 4 .2 5.9.6l-.8 2.7Z" />
        <path d="M40 22.3c-2.2 1.6-4 3.5-5.6 5.5-2.1 2.7-2.1 6.5 0 9.3 1.6 2.1 3.4 3.9 5.5 5.4l.1.1.1-.1c2.1-1.6 4-3.4 5.5-5.5 2-2.7 2-6.4 0-9.1-1.5-2.1-3.4-4-5.6-5.6Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h80v80H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}