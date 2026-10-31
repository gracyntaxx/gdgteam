# WORLDCRAFT

## AI-Powered Spatial Intelligence and 3D Interior Design Platform

**Document Type:** Software Requirements Specification (SRS)
**Project Name:** WORLDCRAFT
**Project Category:** AI, Computer Vision, Spatial Intelligence, 3D Reconstruction, Interior Design
**Target Users:** Architects, interior designers, homeowners, tenants, renovators, and people planning new homes
**Technology Stack:** To be determined following technical feasibility research
**Project Stage:** Requirements Definition and Technical Feasibility Assessment

---

# 1. Introduction

## 1.1 Purpose

WORLDCRAFT is an AI-powered web application that transforms images, floor plans, and short videos of real-world environments into editable 3D scenes.

The system combines visual understanding, approximate 3D reconstruction, spatial reasoning, geometric validation, natural-language editing, and interior design assistance to help users understand, evaluate, and modify physical spaces before implementing changes in the real world.

Unlike conventional interior design tools that require users to construct rooms and position objects manually, WORLDCRAFT aims to generate an initial 3D representation automatically and allow users to modify it through text or voice instructions.

The platform will also help users identify potential design problems, improve accessibility, evaluate safety-related spatial constraints, explore affordable renovation options, and discover suitable furniture and home improvement products.

## 1.2 Problem Statement

AI systems can recognize objects in images and generate visually impressive results, but understanding how objects occupy and interact within physical space remains challenging.

Reconstructing an environment requires more than identifying furniture. It requires estimating geometry, understanding spatial relationships, identifying physical inconsistencies, and ensuring that modifications preserve important geometric constraints.

WORLDCRAFT addresses this problem by developing an AI-powered spatial intelligence engine that transforms visual inputs into editable 3D scenes, reasons about object relationships, detects geometric violations, and executes natural-language modifications while maintaining spatial consistency.

The proposed product extends this core capability into practical applications involving interior design, accessibility, safety, and budget-conscious renovation.

## 1.3 Objectives

The system shall aim to:

1. Convert room images, architectural floor plans, and short videos into approximate editable 3D scenes.
2. Estimate the dimensions, positions, orientations, and spatial relationships of rooms and objects.
3. Represent walls, doors, windows, furniture, fixtures, and other identifiable room components.
4. Allow users to modify a reconstructed environment using natural-language instructions or speech.
5. Detect intersecting objects, unsupported placements, and obstructed pathways.
6. Validate proposed modifications against geometric and spatial constraints.
7. Provide AI-assisted interior design recommendations based on color harmony, furniture arrangement, circulation, and the user's preferences.
8. Identify potential accessibility and safety concerns and recommend possible improvements.
9. Generate two alternative interior design concepts for a selected room if the user asks for room redesign inpirations.
10. Support budget-conscious renovation through cost estimation and product recommendations.
11. Enable users to explore furniture and home improvement products available through participating businesses.
12. Evaluate reconstruction quality, spatial reasoning, geometric consistency, and constraint satisfaction.

## 1.4 Scope

### Included in the initial product scope

- Image-based room reconstruction.
- Short-video-based room reconstruction.
- Architectural floor-plan input where supported by the selected processing pipeline.
- Approximate 3D room and object representation. but if user enters relative measurements, it shows the scale.
- Editable scene generation.
- Object selection, movement, rotation, and repositioning.
- Text-based and voice-based scene editing.
- Structured AI-generated edit instructions.
- Spatial relationship representation.
- Geometric collision and pathway checks.
- Design recommendations and violation notifications.
- Accessibility-aware and safety-conscious suggestions.
- Two alternative interior design concepts.
- Budget-based design filtering.
- Furniture and home improvement recommendations.
- Basic project saving and loading.
- Evaluation against predefined test scenarios.

### Future extensions

- Automatic generation of detailed architectural construction plans.
- Precise measurements using depth sensors or calibrated cameras.
- Complete structural engineering analysis.
- Detailed airflow and thermal simulation.
- Real-time collaborative editing.
- Augmented reality previews.
- Advanced photorealistic rendering.
- Live inventory and pricing synchronization across multiple vendors.
- Professional CAD and BIM interoperability.

These extensions should not be treated as completed capabilities unless the required integrations and validation methods are implemented.

## 1.5 Definitions

| Term                     | Definition                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| 2D input                 | A photograph, architectural drawing, or floor plan supplied to the application.                                 |
| Scene reconstruction     | Converting visual observations into an approximate 3D environment.                                              |
| 3D scene                 | A structured environment containing geometry, objects, coordinates, materials, and spatial relationships.       |
| Scene graph              | A representation of objects and their relationships within a scene.                                             |
| Bounding box             | A geometric boundary describing the approximate extent of an object.                                            |
| Spatial constraint       | A condition that must be satisfied for an arrangement to be considered geometrically valid.                     |
| Collision                | An unintended intersection between objects or their occupied geometric volumes.                                 |
| Unsupported placement    | An object placement that lacks the required support according to the applicable geometric rules.                |
| Natural-language editing | Modifying a scene through an instruction expressed in ordinary language.                                        |
| Design alternative       | A proposed arrangement of furniture, colors, materials, or room components.                                     |
| Geometric validation     | Checking spatial arrangements against defined geometric rules.                                                  |
| Accessibility constraint | A measurable requirement intended to support access and use by people with differing mobility or sensory needs. |

---

# 2. Stakeholders and Intended Users

## 2.1 Primary users

### A. Architects

Architects can upload floor plans or room images, inspect approximate 3D geometry, examine spatial relationships, and explore layout modifications.

### B. Interior designers

Interior designers can generate room concepts, test furniture placement, explore color palettes, and present alternative layouts to clients.

### C. Homeowners and people renovating homes

Users can visualize potential changes before purchasing furniture, changing room colors, or undertaking renovations.

### D. Tenants and budget-conscious users

Users can explore affordable furnishing arrangements, compare alternative room concepts, and find products that fit their budgets.

### E. Accessibility-conscious users

Users can explore layouts that may improve movement, reachability, circulation, and usability for elderly people, children, wheelchair users, and others with specific accessibility needs.

## 2.2 Other stakeholders

- Furniture and home improvement businesses.
- Renovation service providers.
- Architects and accessibility professionals who may review recommendations.
- Platform administrators.
- AI model and infrastructure providers.

---

# 3. System Overview

WORLDCRAFT shall consist of logically separated components. Their implementation technologies will be selected after feasibility research.

## 3.1 Proposed logical architecture

### Component 1: User Interface

Responsible for:

- User registration and project access, if authentication is implemented.
- Image, floor-plan, and video uploads.
- Optional room measurements and budget inputs.
- 3D scene visualization.
- Text and voice instructions.
- Design recommendation panels.
- Product recommendations.
- Saving and reopening projects.

### Component 2: Input Processing

Responsible for:

- Validating uploaded file types, sizes, and formats.
- Extracting video frames when required.
- Checking image quality and whether the input is suitable for reconstruction.
- Identifying whether the input represents a photograph, floor plan, or video.
- Requesting additional measurements or images when necessary.

### Component 3: Visual Reconstruction

Responsible for converting supported visual inputs into a structured 3D scene.

The reconstruction pipeline shall estimate or infer:

- Room geometry.
- Walls, floors, ceilings, doors, and windows.
- Furniture and other recognizable objects.
- Approximate dimensions.
- Object positions and orientations.
- Camera-relative and room-relative spatial information.

The implementation may use one model for both images and videos or separate image and video processing pipelines.

### Component 4: Scene Representation

Responsible for maintaining a structured representation of the reconstructed environment.

The scene representation shall contain:

- Room boundaries.
- Object identifiers and types.
- Geometry or references to 3D assets.
- Object dimensions.
- Position and orientation.
- Material and appearance information, when available.
- Object relationships.
- Confidence values and measurement provenance where available.
- Constraints and validation results.

### Component 5: Natural-Language Interpretation

Responsible for converting text or transcribed speech into structured editing instructions.

For example:

"Move the sofa against the left wall and keep the doorway clear."

The system shall convert the instruction into an appropriate operation containing:

- Target object.
- Requested action.
- Destination or target coordinates.
- Orientation, if applicable.
- Relevant spatial constraints.
- Any unresolved ambiguity.
- Validation requirements.

A language model may generate a proposed structured command, but it shall not be treated as the authoritative source of object coordinates or geometric validity.

### Component 6: Spatial Intelligence and Validation

Responsible for:

- Maintaining object relationships.
- Detecting object intersections.
- Checking support relationships where represented.
- Detecting blocked pathways.
- Evaluating proposed object positions.
- Checking required clearances against configured rules.
- Rejecting invalid edits or proposing valid alternatives.
- Recording validation results.

### Component 7: Scene Editing and Rendering

Responsible for applying validated scene changes and displaying the resulting environment.

It shall support:

- Object movement.
- Object rotation.
- Object repositioning.
- Material and color changes.
- Furniture replacement when a suitable asset is available.
- Layout alternatives.
- Scene updates without unnecessary full reconstruction.

### Component 8: Design and Recommendation Engine

Responsible for:

- Interior design suggestions.
- Color palette recommendations.
- Furniture arrangement alternatives.
- Accessibility-related recommendations.
- Safety-related warnings.
- Budget-based design alternatives.
- Product recommendations linked to participating businesses.

### Component 9: Evaluation and Monitoring

Responsible for tracking:

- Reconstruction success and failure.
- Scene-editing success.
- Geometric violations before and after editing.
- Processing time.
- Model and API failures.
- User corrections.
- Evaluation results for predefined and previously unseen scenes.

---

# 4. Functional Requirements

Each requirement has an identifier to support development, testing, and demonstration planning.

## 4.1 User Input and Project Creation

**FR-01: Image Upload**

The system shall allow users to upload photographs of rooms or indoor environments.

**FR-02: Floor-Plan Upload**

The system shall accept supported architectural drawings and floor plans. If the drawing lacks scale information, the system shall request a reference measurement or mark resulting dimensions as estimated.

**FR-03: Video Upload**

The system shall accept supported short videos of indoor environments. The initial target shall be a video of approximately 10 seconds, subject to file-size, processing, and model limitations.

**FR-04: Input Validation**

The system shall validate file type, size, readability, and basic input suitability before processing.

**FR-05: Input Guidance**

The system shall explain when the input is unsuitable for reliable reconstruction and provide actionable suggestions, such as capturing more of the room, improving lighting, or providing additional views.

**FR-06: Optional Room Information**

The system shall allow users to provide known room dimensions, doorway widths, ceiling heights, budget limits, and other relevant information.

**FR-07: Processing Status**

The system shall display processing progress and useful failure messages rather than leaving users with an indefinite loading state.

## 4.2 Visual-to-3D Reconstruction

**FR-08: Image Reconstruction**

The system shall process supported images and generate an approximate 3D representation of the visible environment.

**FR-09: Video Reconstruction**

The system shall process supported video input and use information from multiple frames to estimate the environment.

**FR-10: Floor-Plan Reconstruction**

Where supported by the selected pipeline, the system shall derive a room layout from an architectural floor plan and generate a corresponding 3D representation.

**FR-11: Room Geometry**

The reconstructed scene shall represent identifiable walls, floors, doors, and windows when sufficient evidence is available.

**FR-12: Object Reconstruction**

The system shall identify and represent supported furniture and room components, such as sofas, beds, tables, chairs, cupboards, lamps, curtains, and other visible items.

**FR-13: Approximate Object Properties**

For each reconstructed object, the system shall estimate its position, orientation, dimensions, and spatial extent where the available model supports these outputs.

**FR-14: Editable Scene Generation**

The output shall be represented as an editable 3D scene rather than only as a static generated image.

**FR-15: Reconstruction Uncertainty**

The system shall indicate when geometry or object dimensions are approximate or uncertain.

**FR-16: Reconstruction Failure Handling**

When the system cannot produce a sufficiently usable scene, it shall explain the limitation and request additional input or offer a supported fallback.

## 4.3 Spatial Scene Understanding

**FR-17: Scene Graph**

The system shall maintain a structured representation of the room and its objects.

**FR-18: Relative Position**

The system shall represent relationships such as:

- Left of.
- Right of.
- In front of.
- Behind.
- Above.
- Below.
- Inside.
- Near.
- Attached to.
- Supported by.

Only relationships that can be established or reasonably inferred from the scene shall be asserted as known.

**FR-19: Object Containment**

The system shall represent containment relationships, such as objects inside cabinets or furniture placed within room boundaries, where relevant.

**FR-20: Physical Support**

The system shall represent support relationships, such as a lamp resting on a table or a chair resting on the floor, when the required geometric information is available.

**FR-21: Scene Consistency**

The system shall check whether the scene graph and the underlying geometric representation remain consistent after modifications.

## 4.4 Natural-Language and Voice Editing

**FR-22: Text Commands**

The system shall accept instructions such as:

- "Move the sofa near the left wall."
- "Rotate the dining table by 90 degrees."
- "Move the lamp onto the side table."
- "Change the wall color to a warm beige."
- "Replace the existing chair with a smaller one."
- "Keep the entrance and walking path clear."

**FR-23: Voice Commands**

The system shall optionally accept spoken instructions and convert them into text or structured commands.

**FR-24: Intent Extraction**

The system shall identify the target object, intended operation, destination, and constraints from each instruction.

**FR-25: Structured Edit Representation**

The system shall convert the interpreted instruction into a validated, machine-readable edit request.

**FR-26: Object Identification**

If multiple objects could match an instruction, the system shall ask the user to select the intended object or clarify the request.

**FR-27: Constraint-Aware Editing**

The system shall evaluate the proposed change before applying it.

**FR-28: Invalid Edit Handling**

If an edit violates a required constraint, the system shall reject it or propose a valid alternative.

**FR-29: Edit Confirmation**

For consequential or ambiguous modifications, the system shall explain the proposed change and allow the user to confirm it.

**FR-30: Scene Update**

After a successful edit, the system shall update the structured scene and display the result.

**FR-31: Edit History**

The system should maintain an edit history and support undoing recent changes.

## 4.5 Geometric Validation

**FR-32: Object Intersection Detection**

The system shall detect unintended intersections between represented objects.

**FR-33: Room Boundary Validation**

The system shall identify objects that extend outside room boundaries or intersect represented walls.

**FR-34: Support Validation**

The system shall detect unsupported placements when the necessary support geometry and object relationships are available.

**FR-35: Pathway Obstruction Detection**

The system shall identify when furniture obstructs configured or represented walking paths, doorways, or other designated circulation areas.

**FR-36: Clearance Validation**

The system shall evaluate object clearances against configurable constraints where the necessary dimensions are known.

**FR-37: Pre-Edit and Post-Edit Checks**

The system shall validate a proposed arrangement and recheck the scene after applying an edit.

**FR-38: Explainable Violations**

For each detected violation, the system shall identify the affected object or region, describe the problem, and suggest a correction.

**FR-39: Constraint Preservation**

The system shall preserve required room boundaries and other specified constraints when applying a modification.

**FR-40: Geometric Evaluation**

The system shall provide testable results demonstrating whether specified geometric constraints are satisfied.

## 4.6 Interior Design and Renovation Assistance

**FR-41: Existing Room Analysis**

The system shall analyze a supported room image or reconstructed scene to identify visible furniture, curtains, lamps, windows, walls, and other identifiable design elements.

**FR-42: User Preference Collection**

The system shall allow users to specify preferences such as design style, color palette, intended use, existing items to retain, and budget.

**FR-43: Two Design Alternatives**

The system shall generate two alternative design concepts for the selected room, subject to the available reconstruction, asset, and rendering capabilities.

**FR-44: Existing Room Preservation**

Where possible, the system shall retain the room's identifiable geometry and fixed components while changing selected furniture, finishes, colors, or movable objects.

**FR-45: Color Recommendations**

The system shall recommend color combinations and explain their intended visual effect.

**FR-46: Furniture Arrangement**

The system shall recommend furniture placements while considering room boundaries, circulation, object dimensions, and configured spatial constraints.

**FR-47: Design Comparison**

The system shall allow users to compare the original scene and the two proposed alternatives.

**FR-48: Design Modification**

Users shall be able to further modify either design through natural-language instructions.

**FR-49: Affordable Alternatives**

The system shall prioritize alternatives that fit the user's specified budget and preferences when sufficient product or price data is available.

**FR-50: Existing Furniture Reuse**

The system should recommend retaining or repositioning suitable existing furniture when this offers a practical alternative to replacement.

**FR-51: Design Explanation**

The system shall explain the main design decisions and identify important compromises, such as reduced storage or tighter circulation.

## 4.7 Safety, Accessibility, and Design Recommendations

**FR-52: Design Review**

The system shall evaluate the represented layout against configured design, circulation, accessibility, and safety-related rules.

**FR-53: Recommendation Notifications**

The system shall display recommendations in a clearly identifiable notification or suggestion panel.

**FR-54: Violation Details**

Each notification should contain:

- The issue detected.
- The affected object or area.
- The reason for the warning.
- The applicable rule or recommendation.
- A suggested correction.
- A confidence or uncertainty indicator where appropriate.

**FR-55: Alternative Placement**

Where the system can calculate a feasible alternative, it shall offer a proposed object position or arrangement.

**FR-56: Apply Suggestion**

Users shall be able to apply a supported suggestion and view the resulting 3D scene.

**FR-57: Revalidation**

The system shall rerun the applicable geometric checks after a suggested change is applied.

**FR-58: Accessibility-Aware Layouts**

The system shall check supported accessibility requirements, including relevant clearances, circulation space, and access to designated room components, when the necessary dimensions are known.

**FR-59: Elderly and Child-Friendly Considerations**

The system should identify selected layout risks, such as narrow circulation paths, unstable-looking arrangements, or potentially hazardous obstructions, when supported by the available scene information and configured rules.

**FR-60: Emergency Access**

The system shall identify obstructions affecting designated exits or emergency routes when those routes and applicable constraints have been provided or reliably represented.

**FR-61: Safety Limitations**

The system shall distinguish automated design recommendations from verified professional assessments.

**FR-62: Rule-Based Validation**

Measurable geometric requirements shall be checked by deterministic rules wherever possible, rather than relying exclusively on a language model's judgment.

## 4.8 Budget and Product Recommendations

**FR-63: Budget Input**

Users shall be able to enter a target renovation or furnishing budget.

**FR-64: Budget-Aware Design**

The system shall consider the budget when generating design alternatives and selecting recommended products.

**FR-65: Product Catalogue**

The system shall support a catalogue of relevant furniture, lighting, furnishings, paint, and home improvement products.

**FR-66: Product Matching**

The system shall match available products against design requirements, approximate dimensions, user preferences, and budget.

**FR-67: Product Information**

Where available, recommendations shall include the product name, image, price, dimensions, seller, and purchase link.

**FR-68: Product-to-Scene Relationship**

Where a suitable 3D asset is available, the system should allow users to preview a recommended product in the scene.

**FR-69: Cost Estimate**

The system shall provide an indicative estimate of the cost of selected products and supported renovation items.

**FR-70: Cost Transparency**

The system shall distinguish known product prices from estimates and clearly state when labour, installation, delivery, or other costs are excluded.

**FR-71: Business Partnerships**

The platform should support participating sellers and service providers through configurable product listings or integrations.

**FR-72: Affiliate Disclosure**

If the platform earns commission from a purchase or referral, it shall disclose the commercial relationship clearly.

**FR-73: Product Availability**

The system shall not present unverified inventory, prices, or purchase links as confirmed current information.

## 4.9 Project Management

**FR-74: Project Saving**

Users should be able to save a reconstructed scene and its selected design alternatives.

**FR-75: Project Loading**

Users should be able to reopen a previously saved project.

**FR-76: Scene Export**

The system should support export to selected 3D formats where the underlying geometry and assets permit it.

**FR-77: Visual Comparison**

Users should be able to view the original representation alongside a modified version.

**FR-78: Project Metadata**

A saved project should retain relevant room information, object properties, edit history, constraints, and validation results.

---

# 5. Core User Flows

## 5.1 Flow A: Reconstruct a Room and Edit It

1. The user opens WORLDCRAFT.
2. The user uploads a room photograph, a supported floor plan, or an approximately 10-second video.
3. The system validates the input and requests additional measurements if required.
4. The visual processing pipeline analyzes the input.
5. The reconstruction pipeline estimates the room geometry and identifies visible objects.
6. The system generates a structured scene containing geometry, object properties, and spatial relationships.
7. The 3D viewer displays the reconstructed environment.
8. The user enters an instruction or provides a voice command.
9. The language-processing component interprets the instruction and produces a structured edit request.
10. The scene engine checks the target object, destination, geometric constraints, and relevant safety rules.
11. If the edit is invalid, the system suggests a feasible alternative or asks the user for clarification.
12. If valid, the system updates the scene and renders the result.
13. The system reruns the applicable validation checks.
14. The user can accept the modification, undo it, or request further changes.

**Expected result:** An editable 3D scene whose modifications are checked for spatial consistency.

## 5.2 Flow B: Identify and Correct a Spatial Violation

1. The user reconstructs or opens a room scene.
2. The system evaluates represented object positions and relationships.
3. The validator identifies an issue, such as a table intersecting a sofa or furniture obstructing a designated pathway.
4. The system highlights the affected object or region.
5. The system explains the issue and proposes one or more possible corrections.
6. The user selects a proposed correction.
7. The scene engine checks whether the proposed arrangement satisfies the relevant constraints.
8. The system applies the valid correction and updates the 3D scene.
9. The system confirms which checks passed and identifies any remaining concerns.

**Expected result:** A demonstrated example of spatial reasoning, geometric validation, and constraint-preserving modification.

## 5.3 Flow C: Generate Two Interior Design Concepts

1. The user uploads a photograph or supported video of an existing room.
2. The system identifies visible room components and reconstructs the available scene.
3. The user specifies a preferred design style, budget, colors, and items to retain.
4. The system generates two alternative design proposals.
5. Each proposal includes a modified 3D scene, furniture arrangement, colors, and supported material changes.
6. The validation engine checks object intersections, room boundaries, and relevant circulation constraints.
7. The user compares both alternatives.
8. The system presents matching products and indicative costs when catalogue data is available.
9. The user selects a preferred alternative and requests further edits.

**Expected result:** Two comparable design concepts derived from the user's existing space.

## 5.4 Flow D: Accessibility and Safety Review

1. The user uploads a supported room image or floor plan.
2. The system reconstructs the room and records any known measurements.
3. The user specifies relevant needs, such as wheelchair circulation, easier movement for an elderly person, or child-conscious furniture arrangements.
4. The system evaluates the scene against applicable configured rules.
5. The system displays potential issues and their locations.
6. The system proposes alternative placements or layout changes.
7. The user applies a suggested modification.
8. The validator checks the updated scene.
9. The system displays the remaining verified geometric checks and unresolved concerns.

**Expected result:** An explainable design review that helps users identify potential problems without falsely claiming complete professional certification.

## 5.5 Flow E: Budget-Based Product Selection

1. The user selects a room or design concept.
2. The user specifies a budget.
3. The system identifies design components that could be retained, repositioned, repaired, or replaced.
4. The product catalogue is searched for suitable alternatives.
5. The system ranks options according to price, dimensions, style, and other available criteria.
6. The user selects a product.
7. If a compatible 3D asset is available, the product is previewed in the room.
8. The system checks the new arrangement and updates the estimated cost.
9. The user can open the seller's product page.

**Expected result:** A practical design option linked to products that can be evaluated against the user's budget.

---

# 6. Structured Data and AI Integration Requirements

## 6.1 General principle

WORLDCRAFT shall use a technology-independent scene schema between the reconstruction models, language-processing component, validation engine, and rendering layer.

The purpose is to prevent individual models or services from requiring incompatible application-level data structures.

The exact model-specific input and output formats shall be established only after the selected models have been researched and tested.

## 6.2 Conceptual scene structure

The application-level scene representation should include:

- Scene identifier.
- Input type and source metadata.
- Coordinate-system definition.
- Units of measurement.
- Room geometry.
- Object identifiers and types.
- Object dimensions.
- Object positions and orientations.
- Geometry or asset references.
- Spatial relationships.
- Fixed and movable object classifications where known.
- Constraints.
- Confidence values where available.
- Measurement sources and uncertainty.
- Validation results.

### Illustrative application-level JSON

The following example describes the intended application-level representation. It is not the required JSON format of any particular model.

```json
{
  "scene_id": "room_001",
  "units": "meters",
  "coordinate_system": {
    "up_axis": "Y",
    "description": "Application-defined coordinate system"
  },
  "room": {
    "type": "living_room",
    "dimensions": {
      "width": 4.5,
      "length": 5.0,
      "height": 2.8,
      "status": "estimated"
    }
  },
  "objects": [
    {
      "id": "sofa_001",
      "type": "sofa",
      "position": {
        "x": 1.2,
        "y": 0.0,
        "z": 2.0
      },
      "dimensions": {
        "width": 2.0,
        "height": 0.9,
        "depth": 0.85
      },
      "rotation": {
        "x": 0,
        "y": 90,
        "z": 0
      },
      "movable": true,
      "confidence": null
    }
  ],
  "constraints": [
    {
      "type": "keep_inside_room",
      "target": "sofa_001"
    }
  ]
}
```

**Important:** The numerical coordinates are illustrative, not reconstructed measurements. The example assumes a particular axis convention and must be adapted to the actual rendering engine. Confidence values must be populated only when supported by the selected pipeline.

## 6.3 Natural-language edit request

A language model may transform a user instruction into a structured operation.

For example, the request "Move the sofa against the left wall" could be represented conceptually as:

```json
{
  "action": "move_object",
  "target_object_id": "sofa_001",
  "destination": {
    "reference": "left_wall",
    "relationship": "adjacent_to"
  },
  "constraints": [
    "keep_inside_room",
    "avoid_object_intersection",
    "preserve_required_pathways"
  ]
}
```

This command expresses intent, not final validated coordinates.

The scene engine must resolve the reference, calculate a feasible position, and validate the resulting geometry.

## 6.4 Model adapters

Every external reconstruction or AI service shall be accessed through a model-specific adapter.

Each adapter shall define:

- Accepted input types.
- Input dimensions and preprocessing requirements.
- API request structure.
- Authentication requirements.
- Model-specific parameter names.
- Expected output structure.
- Coordinate and unit conventions.
- Error handling.
- Timeout and retry behaviour.
- Processing limits.
- Output validation.
- Conversion into the application's internal schema.

The application shall not assume that a reconstruction model accepts the same JSON structure as Gemini or produces the same coordinate system as the renderer.

## 6.5 Data validation

The system shall validate structured outputs before passing them to another component.

Checks shall include:

- Required fields.
- Correct data types.
- Valid object identifiers.
- Valid coordinate values.
- Supported operation types.
- Valid asset references.
- Consistent units.
- Consistent coordinate conventions.
- Valid object dimensions.
- Valid references between scene objects.
- Applicable geometric constraints.

Invalid or incomplete outputs shall be rejected, corrected through a controlled recovery process, or returned for clarification.

## 6.6 Model interoperability

If the selected image and video models produce different output formats, the application shall normalize their results into a common internal scene representation.

If no suitable model can process both input types, separate image and video pipelines may be used.

The pipelines may share downstream components for scene normalization, spatial validation, editing, and rendering.

The system shall not require two models to communicate directly if a shared, validated scene schema can serve as the integration boundary.

---

# 7. Non-Functional Requirements

## 7.1 Performance

- The system should process inputs asynchronously when reconstruction cannot be completed interactively.
- The interface should remain responsive during model inference.
- Reconstruction and rendering time shall be measured during testing.
- The system shall communicate processing status and handle timeouts.
- The project shall define acceptable processing-time targets after the candidate models have been benchmarked.

No specific inference time is guaranteed at this stage because it depends on the selected models, external services, input complexity, and available computing resources.

## 7.2 Reliability

- External API failures shall not silently corrupt the current scene.
- Failed edits shall leave the previous valid scene available.
- Invalid model responses shall be detected.
- Repeated edits shall not unintentionally duplicate objects or corrupt scene identifiers.
- The application shall provide a recoverable failure path for reconstruction and editing.

## 7.3 Usability

- Users shall be able to upload supported inputs without manually building a 3D scene.
- The application shall provide clear instructions for capturing suitable images or videos.
- Editing commands shall use ordinary language.
- Detected issues shall be explained in understandable terms.
- Users shall be able to distinguish reconstructed geometry from verified measurements.

## 7.4 Scalability

- The reconstruction pipeline should be separated from the user interface.
- Model-specific integrations should be replaceable without redesigning the entire application.
- Processing jobs should be separable from interactive rendering.
- The system should support future additions of models, asset libraries, product providers, and validation rules.

## 7.5 Security and Privacy

- API keys shall be stored securely and shall not be exposed in client-side code.
- Uploaded images, videos, floor plans, and project data shall be handled according to a clearly documented privacy policy.
- The system shall validate uploads and restrict access to stored projects.
- External AI services shall receive only the data necessary for the requested operation.
- The system should provide appropriate controls for project deletion and data retention.
- The implementation shall account for the privacy policies and data-handling practices of external providers.

## 7.6 Maintainability

- Reconstruction, scene normalization, spatial validation, language processing, and rendering shall be logically separated.
- Model-specific request and response formats shall be isolated in adapters.
- Validation rules shall be configurable and testable.
- The system shall record enough diagnostic information to identify failures without unnecessarily storing sensitive user content.

## 7.7 Portability

The application should support deployment to a web-accessible environment and should not require users to own high-performance GPUs.

Where feasible, computationally intensive inference shall be performed by an external hosted service.

The final implementation shall document any limitations caused by free inference quotas, rate limits, service availability, or model licensing.

---

# 8. Safety, Accessibility, and Design Rules

## 8.1 Rule categories

The platform should separate its rules into the following categories:

1. Geometric validity.
2. Physical placement and support.
3. Circulation and access.
4. Emergency access.
5. Accessibility.
6. Child-conscious and elderly-conscious design.
7. Interior design preferences.
8. Budget and product constraints.

## 8.2 Deterministic and AI-assisted reasoning

The system shall use deterministic geometry checks for measurable properties wherever possible.

Examples include:

- Whether two represented objects intersect.
- Whether an object exceeds a known room boundary.
- Whether a known doorway is blocked by a represented object.
- Whether a measured clearance meets a configured threshold.
- Whether a proposed position violates a defined room constraint.

AI assistance may be used to interpret instructions, explain results, propose alternative arrangements, and provide subjective design guidance.

However, a language model's statement that a room is safe or accessible shall not itself constitute a validated safety result.

## 8.3 Applicable standards

Accessibility and safety recommendations shall use documented, configurable rules appropriate to the selected jurisdiction and use case.

For an India-focused launch, the research and implementation phase should investigate applicable Indian accessibility guidance, building regulations, and fire and emergency egress requirements.

The platform must not assume that a single generic clearance rule is universally applicable to all buildings or users.

## 8.4 Airflow and ventilation

The system may provide preliminary ventilation-related suggestions based on represented windows, doors, room geometry, and user-provided information.

It shall not claim to calculate actual airflow or certify ventilation performance without a suitable simulation method and the necessary physical inputs.

## 8.5 Human review

Where an issue requires structural engineering, fire-safety expertise, professional accessibility assessment, or other specialized verification, the system shall identify that limitation and recommend appropriate professional review.

---

# 9. Evaluation and Acceptance Criteria

The project shall be evaluated against the original WORLDCRAFT requirements, not merely against the visual attractiveness of the generated room.

## 9.1 Functional acceptance criteria

| ID    | Test                                     | Expected result                                                                                     |
| ----- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| AC-01 | Upload a supported room image            | The system processes the image or reports a meaningful failure.                                     |
| AC-02 | Upload a supported short video           | The video pipeline produces a scene or reports a meaningful failure.                                |
| AC-03 | Reconstruct a room                       | An editable 3D scene is generated, not only a static image.                                         |
| AC-04 | Inspect the scene                        | Identifiable objects have structured properties and spatial relationships where supported.          |
| AC-05 | Move an object using text                | The system interprets the request and updates the intended object.                                  |
| AC-06 | Move an object using speech              | The system transcribes and interprets the request when voice input is supported.                    |
| AC-07 | Place two objects so they intersect      | The validator detects the intersection.                                                             |
| AC-08 | Move furniture into a designated pathway | The validator identifies the obstruction against the configured pathway constraint.                 |
| AC-09 | Attempt an invalid modification          | The system rejects the edit or proposes a valid alternative.                                        |
| AC-10 | Apply a valid modification               | The scene updates and the relevant constraints are rechecked.                                       |
| AC-11 | Request design analysis                  | The system provides understandable, evidence-based recommendations and identifies uncertainty.      |
| AC-12 | Generate two room concepts               | Two distinct design alternatives are displayed.                                                     |
| AC-13 | Set a budget                             | Available recommendations are filtered or ranked according to the supplied budget and known prices. |
| AC-14 | Select a suggested placement             | The system applies the placement and reruns validation.                                             |
| AC-15 | Test a model/API failure                 | The system handles the failure without corrupting the last valid scene.                             |

## 9.2 Evaluation metrics

The implementation should measure:

### Reconstruction quality

- Room geometry error against reference measurements.
- Object position and orientation error where ground truth is available.
- Object identification performance.
- Completeness of reconstructed objects and surfaces.
- Reconstruction success rate.

### Spatial reasoning

- Accuracy of represented object relationships.
- Accuracy of support and containment relationships.
- Accuracy of identified spatial violations.

### Geometric validation

- Detection rate for deliberately introduced collisions.
- Detection rate for deliberately blocked pathways.
- False-positive rate for valid placements.
- False-negative rate for invalid placements.

### Editing performance

- Correct target-object identification.
- Correct interpretation of the requested operation.
- Percentage of edits executed successfully.
- Percentage of edits that preserve required constraints.
- Recovery rate after invalid requests.

### Product usability

- Time required to obtain an editable scene.
- Time required to complete a common layout change.
- Number of user corrections required.
- Success rate for the main demonstration workflow.

## 9.3 Testing dataset

The team shall create a small test suite containing:

- Simple living rooms.
- Bedrooms.
- Rooms with multiple furniture items.
- Narrow circulation paths.
- Objects positioned close to walls.
- Deliberately intersecting objects.
- Furniture obstructing doorways.
- Ambiguous object references.
- Images with occlusion or poor lighting.
- Scenes with different room dimensions.
- Previously unseen room layouts.

Evaluation should distinguish between failures caused by the reconstruction model and failures caused by the scene validator or editing pipeline.

---

# 10. Constraints and Assumptions

## 10.1 Constraints

- The final technology stack has not yet been selected.
- The initial implementation is intended to be a web application.
- Hosted inference services are preferred over running large models locally.
- Free API access is preferred for the prototype.
- API availability, quotas, and licensing may restrict the choice of models.
- Input reconstruction quality will depend on visual coverage, lighting, occlusion, camera movement, and available measurements.
- Some models generate 3D assets rather than complete room-scale scenes.
- Some image-to-3D models do not accept video or produce structured object coordinates.
- Some models may generate visually convincing geometry without reliable physical dimensions.
- Safety and accessibility validation depends on the completeness and accuracy of the scene.

## 10.2 Assumptions

- Users can supply at least one usable image, supported video, or supported floor plan.
- Users may provide additional measurements when visual inference is insufficient.
- The system can access compatible 3D assets or generate suitable representations for at least the core demonstration.
- A structured intermediate representation can be defined independently of the selected AI models.
- The selected rendering system can display and manipulate the generated scene.
- Product recommendations depend on the availability and accuracy of catalogue data.

---

# 11. Proposed Implementation Phases

## Phase 1: Technical Feasibility

- Research hosted image-to-3D and video-to-3D models.
- Investigate free inference endpoints and their limitations.
- Test whether outputs include usable geometry, object coordinates, and scene relationships.
- Compare available 3D rendering and scene manipulation technologies.
- Select a common internal scene representation.
- Establish the feasibility of the proposed integration.

**Deliverable:** A documented technology decision supported by small working experiments.

## Phase 2: Core Reconstruction

- Implement image upload.
- Implement at least one working reconstruction pipeline.
- Generate an editable 3D room scene.
- Represent objects and their positions.
- Display the result in the web application.

**Deliverable:** A room can be reconstructed and inspected in 3D.

## Phase 3: Spatial Intelligence

- Introduce structured scene data.
- Implement object selection and transformations.
- Add collision detection and room-boundary validation.
- Add support relationships where feasible.
- Implement pathway checks.

**Deliverable:** The scene can detect and explain selected geometric violations.

## Phase 4: Natural-Language Editing

- Connect a language model for instruction interpretation.
- Convert instructions into structured edit requests.
- Validate requests before applying them.
- Update the scene and rerun geometric checks.
- Add clarification and invalid-edit handling.

**Deliverable:** A user can request a scene change in ordinary language and observe a validated result.

## Phase 5: Video and Design Alternatives

- Integrate the video reconstruction pipeline.
- Generate two alternative room designs.
- Introduce style, color, and furniture preferences.
- Add design comparison and editing.

**Deliverable:** The application supports the extended room-design workflow to the extent validated by the selected models.

## Phase 6: Accessibility and Product Recommendations

- Implement configurable accessibility and circulation rules.
- Add explainable recommendation notifications.
- Introduce budget filters.
- Build a product catalogue.
- Link recommended products to available assets and seller pages.

**Deliverable:** A room can be reviewed against selected rules and redesigned with budget-aware recommendations.

## Phase 7: Evaluation and Deployment

- Run the acceptance tests.
- Evaluate reconstruction and validation performance.
- Test API failures and recovery.
- Optimize processing and rendering.
- Deploy the application.
- Document limitations, supported inputs, and setup instructions.

**Deliverable:** A deployed prototype with a reproducible demonstration and documented evaluation.

---

# 12. Recommended Minimum Demonstration

The minimum successful WORLDCRAFT demonstration should show the following sequence:

1. Upload a room image.
2. Generate an editable 3D room scene.
3. Display the reconstructed room and identifiable furniture.
4. Show structured object relationships.
5. Demonstrate a deliberately intersecting object or blocked pathway.
6. Identify the violation using geometric validation.
7. Ask the user to move an object through a natural-language instruction.
8. Convert the instruction into a structured edit request.
9. Apply the edit and validate the resulting geometry.
10. Show the updated 3D scene.
11. Generate two interior design alternatives, if the selected reconstruction and asset pipeline supports them.
12. Demonstrate at least one accessibility-aware or circulation-related recommendation.

A short-video reconstruction and product recommendation can be added as extensions if the chosen models and available development time permit them.

The team should prioritize the end-to-end reconstruction, spatial validation, and natural-language editing pipeline before investing heavily in advanced rendering or commercial features.

---

# 13. Final Project Definition

WORLDCRAFT is a spatial-intelligence platform that transforms visual representations of indoor environments into editable 3D scenes, reasons about relationships between objects, detects geometric inconsistencies, and executes natural-language modifications while preserving defined spatial constraints.

The extended platform applies these capabilities to interior design, accessibility-aware planning, safety-related layout checks, affordable renovation, and product discovery.

Its defining capability is not simply converting pixels into 3D graphics. It is enabling users to **understand, evaluate, and modify a represented physical environment through AI-assisted reasoning and measurable geometric validation**.

The final technology stack, model providers, APIs, rendering engine, and deployment infrastructure shall be selected after a feasibility study of available models, licensing, performance, and integration requirements.
