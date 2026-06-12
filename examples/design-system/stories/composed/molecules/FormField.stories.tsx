import type { Meta, StoryObj } from "@storybook/react";
import { DemoFormField } from "../../../src/storybook/renderers";

const meta: Meta<typeof DemoFormField> = {
  title: "Molecules/FormField",
  component: DemoFormField,
};

export default meta;
type Story = StoryObj<typeof DemoFormField>;

export const Default: Story = {
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    hint: "We never share your email.",
  },
};

export const Invalid: Story = {
  args: {
    label: "Email address",
    placeholder: "not-an-email",
    hint: "Please enter a valid email address.",
    invalid: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    disabled: true,
  },
};
