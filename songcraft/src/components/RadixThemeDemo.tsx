import { Button, Card, Flex, Text, ThemePanel } from "@radix-ui/themes";

export function RadixThemeDemo() {
  return (
    <Card size="3" style={{ maxWidth: 400 }}>
      <Flex direction="column" gap="3">
        <Text size="5" weight="bold">
          Radix Theme Demo
        </Text>

        <Text size="3" color="gray">
          This demonstrates Radix UI theming working properly.
        </Text>

        <Flex gap="2">
          <Button variant="solid" color="crimson">
            Primary
          </Button>
          <Button variant="soft" color="blue">
            Secondary
          </Button>
          <Button variant="outline" color="green">
            Outline
          </Button>
        </Flex>

        <Text size="2" color="gray">
          The ThemePanel below allows you to customize the theme in real-time.
        </Text>

        <ThemePanel />
      </Flex>
    </Card>
  );
}
