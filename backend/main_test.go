package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetHelloMessage(t *testing.T) {
	if got := getHelloMessage(); got != "Backend workflow testing" {
		t.Fatalf("unexpected hello message: %s", got)
	}
}

func TestGetHealthStatus(t *testing.T) {
	status := getHealthStatus()
	if status["status"] != "ok" || status["service"] != "backend" || status["message"] != "Backend service is healthy" {
		t.Fatalf("unexpected health status: %#v", status)
	}
}

func TestProductsHelpers(t *testing.T) {
	products := getProducts()
	if len(products) < 3 {
		t.Fatalf("expected at least three products, got %d", len(products))
	}

	p := findProductByID(1)
	if p == nil || p.Name != "Premium Wireless Headphones" {
		t.Fatalf("expected product id=1 to be headphones, got %#v", p)
	}

	filtered := searchProducts("cotton")
	if len(filtered) != 1 || filtered[0].Name != "Organic Cotton T-Shirt" {
		t.Fatalf("unexpected filtered products: %#v", filtered)
	}
}

func TestBuildEchoPayload(t *testing.T) {
	payload := map[string]any{"action": "ping"}
	result := buildEchoPayload(payload)

	received, ok := result["received"].(map[string]any)
	if !ok || received["action"] != "ping" {
		t.Fatalf("unexpected echo payload: %#v", result)
	}

	if _, ok := result["receivedAt"].(string); !ok {
		t.Fatalf("receivedAt should be a string: %#v", result)
	}
}

func TestAPI(t *testing.T) {
	ts := httptest.NewServer(newServer())
	defer ts.Close()

	t.Run("GET /api/hello", func(t *testing.T) {
		resp, err := http.Get(ts.URL + "/api/hello")
		if err != nil {
			t.Fatalf("request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}

		var body map[string]string
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			t.Fatalf("decode failed: %v", err)
		}
		if body["message"] != "Backend workflow testing" {
			t.Fatalf("unexpected message: %#v", body)
		}
	})

	t.Run("GET /api/health", func(t *testing.T) {
		resp, err := http.Get(ts.URL + "/api/health")
		if err != nil {
			t.Fatalf("request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}

		var body map[string]string
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			t.Fatalf("decode failed: %v", err)
		}
		if body["status"] != "ok" || body["service"] != "backend" {
			t.Fatalf("unexpected payload: %#v", body)
		}
	})

	t.Run("GET /api/time", func(t *testing.T) {
		resp, err := http.Get(ts.URL + "/api/time")
		if err != nil {
			t.Fatalf("request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}

		var body map[string]string
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			t.Fatalf("decode failed: %v", err)
		}
		if body["isoTime"] == "" {
			t.Fatalf("expected isoTime in payload: %#v", body)
		}
	})

	t.Run("GET /api/products", func(t *testing.T) {
		resp, err := http.Get(ts.URL + "/api/products")
		if err != nil {
			t.Fatalf("request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}

		var body struct {
			Products []Product `json:"products"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			t.Fatalf("decode failed: %v", err)
		}
		if len(body.Products) < 3 {
			t.Fatalf("expected at least 3 products, got %d", len(body.Products))
		}
	})

	t.Run("GET /api/products filtered", func(t *testing.T) {
		resp, err := http.Get(ts.URL + "/api/products?search=headphones")
		if err != nil {
			t.Fatalf("request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}

		var body struct {
			Products []Product `json:"products"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			t.Fatalf("decode failed: %v", err)
		}
		if len(body.Products) != 1 || body.Products[0].Name != "Premium Wireless Headphones" {
			t.Fatalf("unexpected products: %#v", body.Products)
		}
	})

	t.Run("GET /api/products/:id", func(t *testing.T) {
		resp, err := http.Get(ts.URL + "/api/products/2")
		if err != nil {
			t.Fatalf("request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}

		var body struct {
			Product Product `json:"product"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			t.Fatalf("decode failed: %v", err)
		}
		if body.Product.ID != 2 || body.Product.Name != "Organic Cotton T-Shirt" {
			t.Fatalf("unexpected product: %#v", body.Product)
		}
	})

	t.Run("GET /api/products/:id 404", func(t *testing.T) {
		resp, err := http.Get(ts.URL + "/api/products/999")
		if err != nil {
			t.Fatalf("request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusNotFound {
			t.Fatalf("expected 404, got %d", resp.StatusCode)
		}

		var body map[string]string
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			t.Fatalf("decode failed: %v", err)
		}
		if body["error"] != "Product not found" {
			t.Fatalf("unexpected payload: %#v", body)
		}
	})

	t.Run("POST /api/echo", func(t *testing.T) {
		payload := []byte(`{"source":"integration-test","ok":true}`)
		resp, err := http.Post(ts.URL+"/api/echo", "application/json", bytes.NewReader(payload))
		if err != nil {
			t.Fatalf("request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}

		var body map[string]any
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			t.Fatalf("decode failed: %v", err)
		}

		received, ok := body["received"].(map[string]any)
		if !ok || received["source"] != "integration-test" {
			t.Fatalf("unexpected echo payload: %#v", body)
		}
		if _, ok := body["receivedAt"].(string); !ok {
			t.Fatalf("missing receivedAt: %#v", body)
		}
	})
}
