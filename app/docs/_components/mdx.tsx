import rehypeShiki from "@shikijs/rehype";
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import type { ShikiTransformerContext } from "@shikijs/types";
import { transformerCollapse } from "fromsrc";
import { rehypeAnchors, rehypeSlug, remarkAlerts } from "fromsrc";
import {
  Accordion,
  AccordionItem,
  Alert,
  Anchor,
  Autofill,
  Avatar,
  AvatarGroup,
  AvatarStack,
  BackToTop,
  Badge,
  Banner,
  BlockMath,
  Breadcrumb,
  BulletItem,
  BulletList,
  Button,
  Callout,
  Card,
  Cards,
  Change,
  Changelog,
  Checkbox,
  CheckItem,
  CheckList,
  Code,
  CodeBlock,
  CodeGroup,
  CodeSandbox,
  CodeTab,
  CodeTabs,
  Collapsible,
  Column,
  Command,
  Compare,
  CompareRow,
  Content,
  Copyable,
  CopyBlock,
  Countdown,
  Create,
  Definition,
  DefinitionList,
  Details,
  Divider,
  Dropdown,
  Endpoint,
  Experimental,
  Feature,
  FeatureCard,
  Features,
  Feedback,
  File,
  Files,
  Flex,
  Folder,
  Frame,
  Gist,
  Github,
  Glossary,
  GlossaryItem,
  Graph,
  Grid,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Highlight,
  HoverInfo,
  Important,
  InlineMath,
  Input,
  Install,
  Kbd,
  LanguageSwitch,
  Line,
  Link,
  LinkCard,
  LinkCards,
  Loading,
  Math,
  Mermaid,
  MobileNav,
  Modal,
  NavLink,
  Note,
  NumberItem,
  NumberList,
  Openapi,
  Openapischema,
  Output,
  Pagination,
  Param,
  Popover,
  Pre,
  Progress,
  ProgressSteps,
  Properties,
  Property,
  Quote,
  Radio,
  RadioGroup,
  Rating,
  ReadTime,
  Release,
  Response,
  Screenshot,
  ScrollProgress,
  Search,
  Select,
  Shortcut,
  Show,
  Sidebar,
  Skeleton,
  SkeletonCard,
  SkeletonText,
  Spinner,
  StackBlitz,
  Status,
  StatusDot,
  Step,
  Steps,
  Switch,
  Tab,
  Table,
  TabNav,
  TabNavDropdown,
  Tabs,
  Tag,
  Tags,
  Terminal,
  Testimonial,
  Testimonials,
  Textarea,
  ThemeToggle,
  Toc,
  TocInline,
  ToastProvider,
  Tooltip,
  Tweet,
  Typed,
  Twoslash,
  TypePopup,
  TypeTable,
  Typewriter,
  Underline,
  User,
  VersionSelect,
  Video,
  YouTube,
  Zoom,
} from "fromsrc/client";
import { MDXRemote } from "next-mdx-remote/rsc";
import { isValidElement } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import remarkGfm from "remark-gfm";

type HeadingProps = ComponentPropsWithoutRef<"h1"> & { children?: ReactNode };
type CodeProps = ComponentPropsWithoutRef<"code"> & { children?: ReactNode };
type PreProps = ComponentPropsWithoutRef<"pre"> & {
  children?: ReactNode;
  "data-language"?: string;
  "data-title"?: string;
  "data-twoslash-annotations"?: string;
  "data-twoslash-noerrors"?: string;
};

function getId(children: ReactNode): string {
  const text = nodeText(children).trim();
  return text
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/[^a-z0-9_-]/g, "")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map((item) => nodeText(item)).join(" ");
  }
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return nodeText(props.children);
  }
  return "";
}

const components = {
  Accordion,
  AccordionItem,
  Alert,
  Anchor,
  Autofill,
  Avatar,
  AvatarGroup,
  AvatarStack,
  BackToTop,
  Badge,
  Banner,
  BlockMath,
  Breadcrumb,
  BulletItem,
  BulletList,
  Button,
  Callout,
  Card,
  Cards,
  Change,
  Changelog,
  CheckItem,
  CheckList,
  Checkbox,
  Code,
  CodeBlock,
  CodeGroup,
  CodeSandbox,
  CodeTab,
  CodeTabs,
  Collapsible,
  Column,
  Command,
  Compare,
  CompareRow,
  Content,
  CopyBlock,
  Copyable,
  Countdown,
  Create,
  Definition,
  DefinitionList,
  Details,
  Divider,
  Dropdown,
  Endpoint,
  Experimental,
  Feature,
  FeatureCard,
  Features,
  Feedback,
  File,
  Files,
  Flex,
  Folder,
  Frame,
  Gist,
  Github,
  Glossary,
  GlossaryItem,
  Graph,
  Grid,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Highlight,
  HoverInfo,
  Important,
  InlineMath,
  Input,
  Install,
  Kbd,
  LanguageSwitch,
  Line,
  Link,
  LinkCard,
  LinkCards,
  Loading,
  Math,
  Mermaid,
  MobileNav,
  Modal,
  NavLink,
  Note,
  NumberItem,
  NumberList,
  Openapi,
  Openapischema,
  Output,
  Pagination,
  Param,
  Popover,
  Pre,
  Progress,
  ProgressSteps,
  Properties,
  Property,
  Quote,
  Radio,
  RadioGroup,
  Rating,
  ReadTime,
  Release,
  Response,
  Screenshot,
  ScrollProgress,
  Search,
  Select,
  Shortcut,
  Show,
  Sidebar,
  Skeleton,
  SkeletonCard,
  SkeletonText,
  Spinner,
  StackBlitz,
  Status,
  StatusDot,
  Step,
  Steps,
  Switch,
  Tab,
  TabNav,
  TabNavDropdown,
  Table,
  Tabs,
  Tag,
  Tags,
  Terminal,
  Testimonial,
  Testimonials,
  Textarea,
  ThemeToggle,
  ToastProvider,
  Toc,
  TocInline,
  Tooltip,
  Tweet,
  TypePopup,
  TypeTable,
  Typed,
  Typewriter,
  Underline,
  User,
  VersionSelect,
  Video,
  YouTube,
  Zoom,
  code: (props: CodeProps) => <code {...props} />,
  h2: (props: HeadingProps) => <h2 id={getId(props.children)} {...props} />,
  h3: (props: HeadingProps) => <h3 id={getId(props.children)} {...props} />,
  h4: (props: HeadingProps) => <h4 id={getId(props.children)} {...props} />,
  pre: (props: PreProps) => {
    const lang = props["data-language"] || "";
    const title = props["data-title"] || "";
    const data = props["data-twoslash-annotations"];
    const noerrors = typeof props["data-twoslash-noerrors"] === "string";
    const active = Boolean(data || noerrors);
    return (
      <CodeBlock lang={lang} title={title || undefined} lines={active}>
        <>
          <pre {...props} />
          {active ? <Twoslash data={data} noerrors={noerrors} /> : null}
        </>
      </CodeBlock>
    );
  },
};

interface Props {
  source: string;
}

export function MDX({ source }: Props) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        blockDangerousJS: true,
        blockJS: false,
        mdxOptions: {
          rehypePlugins: [
            rehypeSlug,
            rehypeAnchors,
            [
              rehypeShiki,
              {
                themes: {
                  light: "github-light",
                  dark: "github-dark-default",
                },
                defaultColor: false,
                transformers: [
                  transformerMetaHighlight(),
                  transformerNotationHighlight(),
                  transformerNotationDiff(),
                  transformerNotationFocus(),
                  transformerNotationWordHighlight(),
                  transformerCollapse(),
                  {
                    pre(
                      this: ShikiTransformerContext,
                      node: { properties: Record<string, string> }
                    ) {
                      const lang = this.options.lang || "";
                      if (lang) {
                        node.properties["data-language"] = lang;
                      }
                      const meta = this.options.meta?.__raw || "";
                      const match = meta.match(/title="([^"]*)"/);
                      if (match) {
                        node.properties["data-title"] = match[1]!;
                      }
                    },
                  },
                ],
              },
            ],
          ],
          remarkPlugins: [remarkGfm, remarkAlerts],
        },
      }}
    />
  );
}
