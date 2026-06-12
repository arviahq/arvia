import type { Meta, StoryObj } from "@storybook/react";
import { DemoFeatureGrid } from "../../../src/storybook/renderers";

const meta: Meta<typeof DemoFeatureGrid> = {
  title: "Organisms/FeatureGrid",
  component: DemoFeatureGrid,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof DemoFeatureGrid>;

export const Default: Story = {};
