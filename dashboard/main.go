// dashboard — view data/products.md as a sortable, filterable table.
// Ponytail: plain Go, no TUI framework. Run: go run . --path .. [--sort score|date|status|num] [--filter <status>]
package main

import (
	"bufio"
	"flag"
	"fmt"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

func main() {
	root := flag.String("path", ".", "repo root (contains data/products.md)")
	sortKey := flag.String("sort", "num", "num | score | date | status")
	filter := flag.String("filter", "", "filter by status (e.g. Validated)")
	flag.Parse()

	f, err := os.Open(*root + "/data/products.md")
	if err != nil {
		fmt.Fprintln(os.Stderr, "no data/products.md at", *root+"/data/products.md")
		os.Exit(1)
	}
	defer f.Close()

	var rows [][]string
	sc := bufio.NewScanner(f)
	sc.Buffer(make([]byte, 1<<20), 1<<20)
	for sc.Scan() {
		line := sc.Text()
		if !strings.HasPrefix(line, "|") {
			continue
		}
		c := splitRow(line)
		if len(c) < 9 {
			continue
		}
		// skip header + separator
		if c[0] == "#" || strings.HasPrefix(c[0], "-") {
			continue
		}
		if _, err := strconv.Atoi(strings.TrimSpace(c[0])); err != nil {
			continue
		}
		rows = append(rows, c)
	}

	if *filter != "" {
		rows = filterRows(rows, *filter)
	}
	sortRows(rows, *sortKey)

	fmt.Printf("%-4s %-12s %-34s %-26s %-7s %-12s\n", "#", "Date", "Product", "Source", "Score", "Status")
	fmt.Println(strings.Repeat("-", 100))
	for _, r := range rows {
		fmt.Printf("%-4s %-12s %-34.34s %-26.26s %-7s %-12s\n",
			trim(r[0]), trim(r[1]), trim(r[2]), trim(r[3]), trim(r[4]), trim(r[5]))
	}
	fmt.Printf("\n%d product(s)\n", len(rows))
}

var ws = regexp.MustCompile(`\s+`)

func splitRow(line string) []string {
	parts := strings.Split(line, "|")
	// drop leading/trailing empty cells from the opening/closing |
	if len(parts) > 0 && strings.TrimSpace(parts[0]) == "" {
		parts = parts[1:]
	}
	if len(parts) > 0 && strings.TrimSpace(parts[len(parts)-1]) == "" {
		parts = parts[:len(parts)-1]
	}
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		out = append(out, ws.ReplaceAllString(strings.TrimSpace(p), " "))
	}
	return out
}

func trim(s string) string { return strings.TrimSpace(s) }

func filterRows(rows [][]string, st string) [][]string {
	out := rows[:0]
	for _, r := range rows {
		if strings.EqualFold(trim(r[5]), st) {
			out = append(out, r)
		}
	}
	return out
}

func sortRows(rows [][]string, key string) {
	switch key {
	case "score":
		sort.SliceStable(rows, func(i, j int) bool { return scoreNum(rows[i][4]) > scoreNum(rows[j][4]) })
	case "date":
		sort.SliceStable(rows, func(i, j int) bool { return rows[i][1] > rows[j][1] })
	case "status":
		sort.SliceStable(rows, func(i, j int) bool { return rows[i][5] < rows[j][5] })
	default:
		sort.SliceStable(rows, func(i, j int) bool { return numInt(rows[i][0]) < numInt(rows[j][0]) })
	}
}

func scoreNum(s string) float64 {
	f, _ := strconv.ParseFloat(strings.TrimSuffix(strings.TrimSpace(s), "/5"), 64)
	return f
}
func numInt(s string) int { n, _ := strconv.Atoi(strings.TrimSpace(s)); return n }
