package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

type Product struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

func getHelloMessage() string {
	return "Backend workflow testing"
}

func getHealthStatus() map[string]string {
	return map[string]string{
		"status":  "ok",
		"service": "backend",
		"message": "Backend service is healthy",
	}
}

func getServerTime() map[string]string {
	return map[string]string{
		"isoTime": time.Now().UTC().Format(time.RFC3339Nano),
	}
}

func getProducts() []Product {
	return []Product{
		{ID: 1, Name: "Premium Wireless Headphones", Price: 129.99},
		{ID: 2, Name: "Organic Cotton T-Shirt", Price: 29.5},
		{ID: 3, Name: "Ergonomic Office Chair", Price: 249.0},
	}
}

func findProductByID(id int) *Product {
	for _, product := range getProducts() {
		if product.ID == id {
			p := product
			return &p
		}
	}
	return nil
}

func searchProducts(query string) []Product {
	normalized := strings.ToLower(strings.TrimSpace(query))
	if normalized == "" {
		return getProducts()
	}

	filtered := make([]Product, 0)
	for _, product := range getProducts() {
		if strings.Contains(strings.ToLower(product.Name), normalized) {
			filtered = append(filtered, product)
		}
	}
	return filtered
}

func buildEchoPayload(body map[string]any) map[string]any {
	return map[string]any{
		"received":   body,
		"receivedAt": time.Now().UTC().Format(time.RFC3339Nano),
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func parseJSONBody(r *http.Request) (map[string]any, error) {
	if r.Body == nil {
		return map[string]any{}, nil
	}

	decoder := json.NewDecoder(r.Body)
	var payload map[string]any
	if err := decoder.Decode(&payload); err != nil {
		if errors.Is(err, io.EOF) {
			return map[string]any{}, nil
		}
		return nil, err
	}

	return payload, nil
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func newServer() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("Backend is running. Try /api/hello"))
	})

	mux.HandleFunc("/api/hello", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": getHelloMessage()})
	})

	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		writeJSON(w, http.StatusOK, getHealthStatus())
	})

	mux.HandleFunc("/api/time", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		writeJSON(w, http.StatusOK, getServerTime())
	})

	mux.HandleFunc("/api/products", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		search := r.URL.Query().Get("search")
		writeJSON(w, http.StatusOK, map[string]any{"products": searchProducts(search)})
	})

	mux.HandleFunc("/api/products/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		idStr := strings.TrimPrefix(r.URL.Path, "/api/products/")
		id, err := strconv.Atoi(idStr)
		if err != nil || id < 1 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid product id"})
			return
		}

		product := findProductByID(id)
		if product == nil {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "Product not found"})
			return
		}

		writeJSON(w, http.StatusOK, map[string]any{"product": product})
	})

	mux.HandleFunc("/api/echo", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		payload, err := parseJSONBody(r)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON payload"})
			return
		}

		writeJSON(w, http.StatusOK, buildEchoPayload(payload))
	})

	return withCORS(mux)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	address := fmt.Sprintf("0.0.0.0:%s", port)
	log.Printf("Backend running on port %s", port)
	if err := http.ListenAndServe(address, newServer()); err != nil {
		log.Fatal(err)
	}
}
