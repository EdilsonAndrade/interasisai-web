import { fireEvent, render, screen } from "@testing-library/react";
import { KnowledgeBaseItemsGrid } from "./KnowledgeBaseItemsGrid";

const items = [
  {
    id: "item-1",
    tenant_id: "1234",
    source_type: "file" as const,
    filename: "precos.xlsx",
    content_preview: "prévia do arquivo de preços",
    content_length: 4832,
    created_at: "2026-09-01T12:00:00Z",
    updated_at: "2026-09-01T12:00:00Z",
  },
  {
    id: "item-2",
    tenant_id: "1234",
    source_type: "texto" as const,
    filename: null,
    content_preview: "prévia do texto colado",
    content_length: 200,
    created_at: "2026-09-01T12:00:00Z",
    updated_at: "2026-09-01T12:00:00Z",
  },
];

describe("KnowledgeBaseItemsGrid", () => {
  it("shows an empty-state message when there are no items", () => {
    render(<KnowledgeBaseItemsGrid items={[]} onSelectItem={jest.fn()} />);
    expect(
      screen.getByText("Nenhum item de ingestão cadastrado para este tenant ainda."),
    ).toBeInTheDocument();
  });

  it("renders a row per item with filename and truncated preview", () => {
    render(<KnowledgeBaseItemsGrid items={items} onSelectItem={jest.fn()} />);

    expect(screen.getByText("precos.xlsx")).toBeInTheDocument();
    expect(screen.getByText("prévia do arquivo de preços")).toBeInTheDocument();
  });

  it("labels a pasted-text item (null filename) as 'Texto colado'", () => {
    render(<KnowledgeBaseItemsGrid items={items} onSelectItem={jest.fn()} />);
    expect(screen.getByText("Texto colado")).toBeInTheDocument();
  });

  it("calls onSelectItem with the item id when a row is clicked", () => {
    const onSelectItem = jest.fn();
    render(<KnowledgeBaseItemsGrid items={items} onSelectItem={onSelectItem} />);

    fireEvent.click(screen.getByText("precos.xlsx"));

    expect(onSelectItem).toHaveBeenCalledWith("item-1");
  });
});
