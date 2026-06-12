import type { Meta, StoryObj } from "@storybook/react";
import { DemoAlert } from "../../../src/storybook/renderers";

const meta: Meta<typeof DemoAlert> = {
  title: "Molecules/Alert",
  component: DemoAlert,
  argTypes: {
    tone: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DemoAlert>;

export const Info: Story = {
  args: {
    tone: "info",
    icon: "ℹ",
    title: "Information",
    message: "Your changes have been saved as a draft.",
  },
};

export const Success: Story = {
  args: {
    tone: "success",
    icon: "✓",
    title: "Success",
    message: "Payment processed successfully.",
  },
};

export const Warning: Story = {
  args: {
    tone: "warning",
    icon: "⚠",
    title: "Warning",
    message: "Your subscription expires in 3 days.",
  },
};

export const Danger: Story = {
  args: {
    tone: "danger",
    icon: "✕",
    title: "Error",
    message: "Unable to connect to the server.",
  },
};
