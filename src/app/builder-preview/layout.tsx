import type { ReactNode } from "react";

interface BuilderPreviewLayoutProps {
	children: ReactNode;
}

export default function BuilderPreviewLayout({
	children,
}: BuilderPreviewLayoutProps) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta content="width=device-width, initial-scale=1" name="viewport" />
				<title>Builder Preview</title>
			</head>
			<body>{children}</body>
		</html>
	);
}
