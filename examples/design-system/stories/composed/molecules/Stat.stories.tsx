import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "../../../src/atoms/stack.arv";
import { DemoStat } from "../../../src/storybook/renderers";

const meta: Meta<typeof DemoStat> = {
  title: "Molecules/Stat",
  component: DemoStat,
  decorators: [
    (Story) => {
      const row = Stack({ direction: "row", gap: "5" });
      return (
        <div className={row.root}>
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof DemoStat>;

export const Default: Story = {
  args: {
    value: "1,234",
    label: "Active users",
    size: "md",
    tone: "default",
  },
};

export const Grid: Story = {
  render: () => {
    const row = Stack({ direction: "row", gap: "6" });
    return (
      <div className={row.root}>
        <DemoStat value="98.2%" label="Uptime" tone="success" />
        <DemoStat value="4.2s" label="Build time" tone="primary" />
        <DemoStat value="12" label="Components" />
      </div>
    );
  },
};
