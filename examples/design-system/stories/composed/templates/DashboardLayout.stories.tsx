import type { Meta, StoryObj } from "@storybook/react";
import { DemoDashboardLayout } from "../../../src/storybook/renderers";

const meta: Meta<typeof DemoDashboardLayout> = {
  title: "Templates/DashboardLayout",
  component: DemoDashboardLayout,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Sidebar is hidden below the lg breakpoint and shown at lg and above.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DemoDashboardLayout>;

export const Default: Story = {};
