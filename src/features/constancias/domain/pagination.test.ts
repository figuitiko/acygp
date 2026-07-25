import { describe, expect, it } from "vitest";

import { createPagination } from "./pagination";

describe("createPagination", () => {
  it("normalizes invalid pages to the first page", () => {
    expect(createPagination({ page: "abc", pageSize: 10, totalItems: 21 })).toMatchObject({
      page: 1,
      pageSize: 10,
      offset: 0,
      totalPages: 3,
      hasPreviousPage: false,
      hasNextPage: true,
    });
  });

  it("calculates offset and next/previous flags", () => {
    expect(createPagination({ page: "2", pageSize: 10, totalItems: 21 })).toMatchObject({
      page: 2,
      pageSize: 10,
      offset: 10,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true,
    });
  });

  it("clamps pages beyond the final page", () => {
    expect(createPagination({ page: "99", pageSize: 10, totalItems: 21 })).toMatchObject({
      page: 3,
      offset: 20,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: false,
    });
  });
});
