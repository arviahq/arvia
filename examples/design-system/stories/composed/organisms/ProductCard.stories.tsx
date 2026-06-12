import type { Meta, StoryObj } from "@storybook/react";
import { DemoProductCard } from "../../../src/storybook/renderers";

const meta: Meta<typeof DemoProductCard> = {
  title: "Organisms/ProductCard",
  component: DemoProductCard,
  parameters: {
    docs: {
      description: {
        component:
          "Resize the container to see container-query layout switch from stacked to horizontal at the wide breakpoint.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DemoProductCard>;

export const Default: Story = {};

export const NarrowContainer: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 320, resize: "horizontal", overflow: "auto", padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export const WideContainer: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 600, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};
