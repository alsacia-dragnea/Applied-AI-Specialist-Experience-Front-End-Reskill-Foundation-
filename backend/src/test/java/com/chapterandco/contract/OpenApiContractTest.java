package com.chapterandco.contract;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.io.File;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/**
 * Contract test: the committed specification (docs/openapi.yaml) must describe exactly the
 * operations the running application exposes. It fails the build when someone adds, removes
 * or renames an endpoint without regenerating the spec - the drift that previously left
 * docs/openapi.yaml describing a different API.
 *
 * To regenerate the spec after an intentional API change see docs/AGENTIC-WORKFLOW.md
 * (skill "regenerate-openapi").
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("OpenAPI contract")
class OpenApiContractTest {

    private static final Set<String> HTTP_METHODS = Set.of("get", "post", "put", "patch", "delete");

    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("docs/openapi.yaml lists exactly the operations the application serves")
    void committedSpecMatchesRunningApplication() throws Exception {
        String generated = mockMvc.perform(get("/api-docs")).andReturn().getResponse().getContentAsString();
        JsonNode live = new ObjectMapper().readTree(generated);
        JsonNode committed = new YAMLMapper().readTree(new File("../docs/openapi.yaml"));

        Set<String> liveOps = operations(live);
        Set<String> committedOps = operations(committed);

        assertThat(liveOps)
                .as("operations served by the application (/api-docs)")
                .isNotEmpty();
        assertThat(committedOps)
                .as("docs/openapi.yaml is out of date - regenerate it from /api-docs")
                .isEqualTo(liveOps);
    }

    @Test
    @DisplayName("every operation in the spec declares at least one response")
    void everyOperationHasResponses() throws Exception {
        JsonNode committed = new YAMLMapper().readTree(new File("../docs/openapi.yaml"));
        Iterator<Map.Entry<String, JsonNode>> paths = committed.get("paths").fields();
        while (paths.hasNext()) {
            Map.Entry<String, JsonNode> path = paths.next();
            Iterator<Map.Entry<String, JsonNode>> ops = path.getValue().fields();
            while (ops.hasNext()) {
                Map.Entry<String, JsonNode> op = ops.next();
                if (HTTP_METHODS.contains(op.getKey())) {
                    assertThat(op.getValue().has("responses"))
                            .as("%s %s has responses", op.getKey().toUpperCase(), path.getKey())
                            .isTrue();
                }
            }
        }
    }

    private static Set<String> operations(JsonNode spec) {
        Set<String> result = new TreeSet<>();
        Iterator<Map.Entry<String, JsonNode>> paths = spec.get("paths").fields();
        while (paths.hasNext()) {
            Map.Entry<String, JsonNode> path = paths.next();
            Iterator<String> methods = path.getValue().fieldNames();
            while (methods.hasNext()) {
                String method = methods.next();
                if (HTTP_METHODS.contains(method)) {
                    result.add(method.toUpperCase() + " " + path.getKey());
                }
            }
        }
        return result;
    }
}
