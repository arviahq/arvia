import { Code } from "../Code";

export function DocCode(props: { label?: string; lang?: string; code: string }) {
  return (
    <Code label={props.label} lang={props.lang}>
      {props.code}
    </Code>
  );
}
