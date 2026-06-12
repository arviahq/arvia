import type { Meta, StoryObj } from "@storybook/react";
import { DemoConfirmPanel } from "../../../src/storybook/renderers";

const meta: Meta<typeof DemoConfirmPanel> = {
  title: "Organisms/ConfirmPanel",
  component: DemoConfirmPanel,
};

export default meta;
type Story = StoryObj<typeof DemoConfirmPanel>;

export const Default: Story = {};
