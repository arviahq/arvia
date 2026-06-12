import type { Meta, StoryObj } from "@storybook/react";
import { DemoPageShell } from "../../../src/storybook/renderers";

const meta: Meta<typeof DemoPageShell> = {
  title: "Templates/PageShell",
  component: DemoPageShell,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DemoPageShell>;

export const Default: Story = {};
