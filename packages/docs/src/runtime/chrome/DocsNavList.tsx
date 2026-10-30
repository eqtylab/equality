import type { NavNode } from '@eqtylab/docs/types';
import {
  Badge,
  Icon,
  NavList,
  NavListExpandable,
  NavListExpandableContent,
  NavListExpandableTrigger,
  NavListGroup,
  NavListItem,
} from '@eqtylab/equality';

export function DocsNavList({ nodes }: { nodes: NavNode[] }) {
  return (
    <NavList>
      <NavListGroup>
        <Rows nodes={nodes} depth={0} />
      </NavListGroup>
    </NavList>
  );
}

function Rows({ nodes, depth }: { nodes: NavNode[]; depth: number }) {
  return (
    <>
      {nodes.map((node, index) => {
        const prefix = depth === 0 && node.icon ? <Icon icon={node.icon} size="sm" /> : undefined;
        const suffix = node.badge && (
          <Badge variant={node.badge.variant} size="sm">
            {node.badge.text}
          </Badge>
        );

        return node.kind === 'group' && node.children?.length ? (
          <NavListExpandable key={`${index}:${node.kind}:${node.name}`} defaultOpen={node.open}>
            <NavListExpandableTrigger label={node.label} prefix={prefix} suffix={suffix} />
            <NavListExpandableContent>
              <Rows nodes={node.children} depth={depth + 1} />
            </NavListExpandableContent>
          </NavListExpandable>
        ) : (
          <NavListItem
            key={`${index}:${node.kind}:${node.name}`}
            label={node.label}
            href={node.href}
            current={node.current}
            prefix={prefix}
            suffix={suffix}
            target={node.external ? '_blank' : undefined}
            {...linkAttrs(node.attrs)}
          />
        );
      })}
    </>
  );
}

/** Only data-, aria- and id pass. React renders the row: a `style` string from config throws and
 *  fails the site's build, and a `class` would replace the row's own. */
function linkAttrs(attrs: NavNode['attrs']) {
  return Object.fromEntries(
    Object.entries(attrs ?? {})
      .filter(([key]) => key === 'id' || key.startsWith('data-') || key.startsWith('aria-'))
      .filter(([, value]) => value !== false)
      .map(([key, value]) => [key, value === true && !key.startsWith('aria-') ? '' : String(value)])
  );
}
