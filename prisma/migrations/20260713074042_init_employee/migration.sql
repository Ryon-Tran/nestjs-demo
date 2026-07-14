-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCard" (
    "id" SERIAL NOT NULL,
    "cardType" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "EmployeeCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeCard_employeeId_key" ON "EmployeeCard"("employeeId");

-- AddForeignKey
ALTER TABLE "EmployeeCard" ADD CONSTRAINT "EmployeeCard_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
