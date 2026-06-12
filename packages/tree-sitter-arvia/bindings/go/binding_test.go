package tree_sitter_arvia_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-arvia"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_arvia.Language())
	if language == nil {
		t.Errorf("Error loading Arvia grammar")
	}
}
