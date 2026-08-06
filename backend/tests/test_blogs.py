from app.domain.entities import BlogPost
from app.infrastructure.repositories import BlogPostRepository

def test_blog_post_tags_crud():
    repo = BlogPostRepository()
    post = BlogPost(
        title="Q3 Market Outlook",
        slug="q3-market-outlook",
        markdown_content="# Market Outlook\nBullish sentiment across IT & Energy.",
        tags=["Market", "Equities", "Strategy"],
        author="Tejas Suthar"
    )
    created = repo.create(post)
    assert created.id is not None
    assert "Equities" in created.tags

    # Filter by tag
    tagged_items, total = repo.get_all_paginated(1, 10, tag="Equities")
    assert total >= 1
    assert any(b.id == created.id for b in tagged_items)

    repo.delete(created.id)
