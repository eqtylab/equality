import type { NavNode } from '@eqtylab/docs/types';
import { Badge, Icon, NavList, NavListGroup, NavListItem } from '@eqtylab/equality';

/** The sidebar on Equality's NavList parts. A draft that tests the names before 4.15.0 freezes them;
 *  GRD-193 wires it into NavTree.astro and adds folding. */
export function DocsNavList({ nodes }: { nodes: NavNode[] }) {
  const sections: { label?: string; nodes: NavNode[] }[] = [];
  for (const node of nodes) {
    if (node.kind === 'group' && node.children?.length) {
      sections.push({ label: node.label, nodes: node.children });
    } else if (sections.length && !sections[sections.length - 1].label) {
      sections[sections.length - 1].nodes.push(node);
    } else {
      sections.push({ nodes: [node] });
    }
  }

  return (
    <NavList>
      {sections.map((section, index) => (
        <NavListGroup key={section.label ?? index} label={section.label}>
          <Rows nodes={section.nodes} depth={0} />
        </NavListGroup>
      ))}
    </NavList>
  );
}

function Rows({ nodes, depth }: { nodes: NavNode[]; depth: number }) {
  return (
    <>
      {nodes.map((node) =>
        node.kind === 'group' && node.children?.length ? (
          <NavListGroup key={node.name} label={node.label}>
            <Rows nodes={node.children} depth={depth + 1} />
          </NavListGroup>
        ) : (
          <NavListItem
            key={node.name}
            label={node.label}
            href={node.href}
            current={node.current}
            prefix={depth === 0 && node.icon ? <Icon icon={node.icon} size="sm" /> : undefined}
            suffix={node.badge || node.external ? <Suffix node={node} /> : undefined}
            target={node.external ? '_blank' : undefined}
            rel={node.external ? 'noopener noreferrer' : undefined}
            {...(node.attrs ?? {})}
          />
        )
      )}
    </>
  );
}

function Suffix({ node }: { node: NavNode }) {
  return (
    <>
      {node.badge && (
        <Badge variant={node.badge.variant} size="sm">
          {node.badge.text}
        </Badge>
      )}
      {node.external && (
        <span aria-hidden="true">
          <Icon icon="ArrowUpRight" size="xs" />
        </span>
      )}
    </>
  );
}
