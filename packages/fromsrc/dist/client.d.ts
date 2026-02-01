import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

interface Props$3 {
    source: string;
}
declare function Content({ source }: Props$3): react_jsx_runtime.JSX.Element;

interface CodeBlockProps {
    children: ReactNode;
    lang?: string;
    title?: string;
}
declare function CodeBlock({ children, lang, title }: CodeBlockProps): react_jsx_runtime.JSX.Element;

interface InstallProps {
    package: string;
}
declare function Install({ package: pkg }: InstallProps): react_jsx_runtime.JSX.Element;

declare function Create(): react_jsx_runtime.JSX.Element;

interface DocMeta {
    slug: string;
    title: string;
    description?: string;
    order?: number;
}

interface Section {
    title: string;
    items: DocMeta[];
}
interface Props$2 {
    title: string;
    logo?: ReactNode;
    navigation: Section[];
    docs: DocMeta[];
    basePath?: string;
    github?: string;
}
declare function Sidebar({ title, logo, navigation, docs, basePath, github }: Props$2): react_jsx_runtime.JSX.Element;

interface Props$1 {
    href: string;
    children: ReactNode;
}
declare function NavLink({ href, children }: Props$1): react_jsx_runtime.JSX.Element;

interface Props {
    basePath?: string;
    docs: DocMeta[];
}
declare function Search({ basePath, docs }: Props): react_jsx_runtime.JSX.Element;

interface Heading {
    id: string;
    text: string;
    level: number;
}
interface TocState {
    headings: Heading[];
    active: string;
    activeRange: string[];
}
declare function useToc(multi?: boolean): TocState;

type TocVariant = "default" | "minimal";
interface TocProps {
    variant?: TocVariant;
    zigzag?: boolean;
    multi?: boolean;
}
declare function Toc({ variant, zigzag, multi }: TocProps): react_jsx_runtime.JSX.Element | null;

export { CodeBlock, Content, Create, type Heading, Install, NavLink, Search, Sidebar, Toc, type TocProps, type TocState, type TocVariant, useToc };
