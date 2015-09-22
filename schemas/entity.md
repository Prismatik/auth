# entity - entities

An entity

The schema defines the following properties:

## `id` (string)

unique identifier of entity

## `rev` (string)

unique identifier of a revision

## `created_at` (string)

when entity was created

## `updated_at` (string)

when entity was updated

## `emails` (array)

The object is an array with all elements of the type `string`.

## `sessions` (array)

The object is an array with all elements of the type `object`.

The array object has the following properties:

### `token` (string)

### `expiry` (string)

## `name` (object)

Properties of the `name` object:

### `full` (string)

### `short` (string)

## `permissions` (array)

The object is an array with all elements of the type `object`.

The array object has the following properties:

### `type` (string)

### `entity` (string)

### `metadata` (object)

Properties of the `metadata` object:

## `inherited_permissions` (array)

The object is an array with all elements of the type `object`.

The array object has the following properties:

### `type` (string)

### `entity` (string)

### `metadata` (object)

Properties of the `metadata` object:

---

# Sub Schemas

The schema defines the following additional types:

## `id` (string)

unique identifier of entity

## `rev` (string)

unique identifier of a revision

## `created_at` (string)

when entity was created

## `updated_at` (string)

when entity was updated

## `emails` (array)

## `sessions` (array)

## `name` (object)

Properties of the `name` object:

### `full` (string)

### `short` (string)

## `permissions` (array)

## `permission` (object)

Properties of the `permission` object:

### `type` (string)

### `entity` (string)

### `metadata` (object)

Properties of the `metadata` object: