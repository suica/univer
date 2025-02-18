import { ErrorType } from '../../Basics/ErrorType';
import { FORMULA_FUNCTION_REGISTRY } from '../../Basics/Registry';
import { ErrorValueObject } from '../../OtherObject/ErrorValueObject';
import { BaseReferenceObject, FunctionVariantType } from '../../ReferenceObject/BaseReferenceObject';
import { BaseValueObject } from '../../ValueObject/BaseValueObject';
import { BaseFunction } from '../BaseFunction';

const FUNCTION_NAME = 'DIVIDED';

export class Divided extends BaseFunction {
    override get name() {
        return FUNCTION_NAME;
    }

    override calculate(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isErrorObject() || variant2.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if ((variant2 as BaseValueObject).getValue() === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        let result;

        if (this.checkArrayType(variant1) && this.checkArrayType(variant2)) {
            result = (variant1 as BaseReferenceObject)
                .toArrayValueObject()
                .divided((variant2 as BaseReferenceObject).toArrayValueObject());
        } else if (this.checkArrayType(variant1)) {
            result = (variant1 as BaseReferenceObject).toArrayValueObject().divided(variant2 as BaseValueObject);
        } else if (this.checkArrayType(variant2)) {
            result = (variant1 as BaseValueObject).divided((variant2 as BaseReferenceObject).toArrayValueObject());
        } else {
            result = (variant1 as BaseValueObject).divided(variant2 as BaseValueObject);
        }

        return result;
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Divided.create());
